package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.dto.TopicSessionRequest;
import com.example.starter_project_2025.system.topic.dto.TopicSessionResponse;
import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import com.example.starter_project_2025.system.topic.entity.TopicObjective;
import com.example.starter_project_2025.system.topic.entity.TopicSession;
import com.example.starter_project_2025.system.topic.repository.TopicLessonRepository;
import com.example.starter_project_2025.system.topic.repository.TopicObjectiveRepository;
import com.example.starter_project_2025.system.topic.repository.TopicSessionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicSessionServiceImpl implements TopicSessionService {

    private static final String[] SESSION_HEADERS = {
            "Session Order",
            "Delivery Type",
            "Training Format",
            "Duration (minutes)",
            "Learning Objective IDs",
            "Content",
            "Note"
    };

    private final TopicSessionRepository topicSessionRepository;
    private final TopicLessonRepository topicLessonRepository;
    private final TopicObjectiveRepository topicObjectiveRepository;

    @Override
    public TopicSessionResponse create(TopicSessionRequest request) {
        TopicLesson lesson = getLessonOrThrow(request.getLessonId());
        validateUniqueOrder(lesson.getId(), request.getSessionOrder(), null);

        TopicSession session = new TopicSession();
        mapRequest(session, request, lesson);

        return toResponse(topicSessionRepository.save(session));
    }

    @Override
    public TopicSessionResponse update(UUID sessionId, TopicSessionRequest request) {
        TopicSession session = topicSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("TopicSession", "id", sessionId));

        TopicLesson lesson = getLessonOrThrow(request.getLessonId());
        validateUniqueOrder(lesson.getId(), request.getSessionOrder(), sessionId);

        mapRequest(session, request, lesson);

        return toResponse(topicSessionRepository.save(session));
    }

    @Override
    public void delete(UUID sessionId) {
        if (!topicSessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("TopicSession", "id", sessionId);
        }
        topicSessionRepository.deleteById(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public TopicSessionResponse getById(UUID sessionId) {
        TopicSession session = topicSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("TopicSession", "id", sessionId));
        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicSessionResponse> getByLessonId(UUID lessonId) {
        return topicSessionRepository.findByLessonIdOrderBySessionOrderAsc(lessonId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportSessions(UUID lessonId) {
        TopicLesson lesson = getLessonOrThrow(lessonId);
        List<TopicSession> sessions = topicSessionRepository.findByLessonIdOrderBySessionOrderAsc(lessonId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Topic Sessions");

            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int columnIndex = 0; columnIndex < SESSION_HEADERS.length; columnIndex++) {
                Cell cell = header.createCell(columnIndex);
                cell.setCellValue(SESSION_HEADERS[columnIndex]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (TopicSession session : sessions) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(session.getSessionOrder() != null ? session.getSessionOrder() : 0);
                row.createCell(1).setCellValue(session.getDeliveryType() != null ? session.getDeliveryType() : "");
                row.createCell(2).setCellValue(session.getTrainingFormat() != null ? session.getTrainingFormat() : "");
                row.createCell(3).setCellValue(session.getDuration() != null ? session.getDuration() : 0);

                String objectiveIds = session.getLearningObjectives().stream()
                        .map(objective -> objective.getId().toString())
                        .reduce((left, right) -> left + "," + right)
                        .orElse("");
                row.createCell(4).setCellValue(objectiveIds);
                row.createCell(5).setCellValue(session.getContent() != null ? session.getContent() : "");
                row.createCell(6).setCellValue(session.getNote() != null ? session.getNote() : "");
            }

            for (int columnIndex = 0; columnIndex < SESSION_HEADERS.length; columnIndex++) {
                sheet.autoSizeColumn(columnIndex);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=topic_sessions_" + lesson.getId() + ".xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(outputStream.toByteArray());
        } catch (Exception exception) {
            throw new RuntimeException("Failed to export topic sessions", exception);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> downloadSessionTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Topic Sessions");

            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);

            Row header = sheet.createRow(0);
            for (int columnIndex = 0; columnIndex < SESSION_HEADERS.length; columnIndex++) {
                Cell cell = header.createCell(columnIndex);
                cell.setCellValue(SESSION_HEADERS[columnIndex]);
                cell.setCellStyle(headerStyle);
            }

            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue(1);
            sample.createCell(1).setCellValue("LIVE_SESSION");
            sample.createCell(2).setCellValue("ONLINE");
            sample.createCell(3).setCellValue(90);
            // Leave objectives blank by default; users fill with valid UUIDs if needed
            sample.createCell(4).setCellValue("");
            sample.createCell(5).setCellValue("Introduction and overview");
            sample.createCell(6).setCellValue("Optional note");

            for (int columnIndex = 0; columnIndex < SESSION_HEADERS.length; columnIndex++) {
                sheet.autoSizeColumn(columnIndex);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=topic_sessions_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(outputStream.toByteArray());
        } catch (Exception exception) {
            throw new RuntimeException("Failed to generate topic session template", exception);
        }
    }

    @Override
    public ImportResultResponse importSessions(UUID lessonId, MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();
        TopicLesson lesson = getLessonOrThrow(lessonId);

        try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            if (!rows.hasNext()) {
                result.buildMessage();
                return result;
            }

            rows.next();
            while (rows.hasNext()) {
                Row row = rows.next();

                String deliveryType = getCellAsString(row, 1);
                if (deliveryType == null || deliveryType.isBlank()) {
                    continue;
                }

                result.setTotalRows(result.getTotalRows() + 1);
                int displayRow = row.getRowNum() + 1;

                try {
                    int sessionOrder = (int) getCellAsNumeric(row, 0);
                    int duration = (int) getCellAsNumeric(row, 3);

                    if (sessionOrder <= 0) {
                        result.addError(displayRow, "sessionOrder", "Session order must be greater than 0.");
                        continue;
                    }
                    if (duration <= 0) {
                        result.addError(displayRow, "duration", "Duration must be greater than 0.");
                        continue;
                    }
                    if (topicSessionRepository.existsByLessonIdAndSessionOrder(lessonId, sessionOrder)) {
                        result.addError(displayRow, "sessionOrder", "Duplicate session order: " + sessionOrder);
                        continue;
                    }

                    String objectiveIdsRaw = getCellAsString(row, 4);
                    List<UUID> objectiveIds = parseObjectiveIds(objectiveIdsRaw, displayRow, result);
                    if (objectiveIds == null) {
                        continue;
                    }

                    TopicSessionRequest request = new TopicSessionRequest();
                    request.setLessonId(lesson.getId());
                    request.setDeliveryType(deliveryType.trim());
                    request.setTrainingFormat(getCellAsString(row, 2));
                    request.setDuration(duration);
                    request.setSessionOrder(sessionOrder);
                    request.setLearningObjectiveIds(objectiveIds);
                    request.setContent(getCellAsString(row, 5));
                    request.setNote(getCellAsString(row, 6));

                    TopicSession session = new TopicSession();
                    mapRequest(session, request, lesson);
                    topicSessionRepository.save(session);
                    result.addSuccess();
                } catch (Exception exception) {
                    result.addError(displayRow, "", exception.getMessage());
                }
            }
        } catch (Exception exception) {
            result.addError(0, "file", "Failed to import topic sessions: " + exception.getMessage());
        }

        result.buildMessage();
        return result;
    }

    private TopicLesson getLessonOrThrow(UUID lessonId) {
        return topicLessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("TopicLesson", "id", lessonId));
    }

    private void validateUniqueOrder(UUID lessonId, Integer sessionOrder, UUID sessionId) {
        boolean duplicate;
        if (sessionId == null) {
            duplicate = topicSessionRepository.existsByLessonIdAndSessionOrder(lessonId, sessionOrder);
        } else {
            duplicate = topicSessionRepository.existsByLessonIdAndSessionOrderAndIdNot(lessonId, sessionOrder, sessionId);
        }

        if (duplicate) {
            throw new BadRequestException("Session order already exists in the selected lesson.");
        }
    }

    private void mapRequest(TopicSession session, TopicSessionRequest request, TopicLesson lesson) {
        if (request.getSessionOrder() == null || request.getSessionOrder() <= 0) {
            throw new BadRequestException("Session order must be greater than 0.");
        }
        if (request.getDuration() == null || request.getDuration() <= 0) {
            throw new BadRequestException("Duration must be greater than 0.");
        }
        if (request.getDeliveryType() == null || request.getDeliveryType().isBlank()) {
            throw new BadRequestException("Delivery type is required.");
        }

        session.setLesson(lesson);
        session.setDeliveryType(request.getDeliveryType().trim());
        session.setTrainingFormat(request.getTrainingFormat() != null ? request.getTrainingFormat().trim() : null);
        session.setDuration(request.getDuration());
        session.setSessionOrder(request.getSessionOrder());
        session.setContent(request.getContent() != null ? request.getContent().trim() : null);
        session.setNote(request.getNote() != null ? request.getNote().trim() : null);

        Set<TopicObjective> objectives = validateAndResolveObjectives(request.getLearningObjectiveIds(), lesson.getTopic().getId());
        session.setLearningObjectives(objectives);
    }

    private Set<TopicObjective> validateAndResolveObjectives(List<UUID> objectiveIds, UUID topicId) {
        if (objectiveIds == null || objectiveIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        List<TopicObjective> objectives = topicObjectiveRepository.findAllById(objectiveIds);
        if (objectives.size() != objectiveIds.size()) {
            throw new BadRequestException("One or more learning objectives are invalid.");
        }

        boolean invalidTopic = objectives.stream()
                .anyMatch(objective -> !objective.getTopic().getId().equals(topicId));
        if (invalidTopic) {
            throw new BadRequestException("Learning objectives must belong to the same topic.");
        }

        return new LinkedHashSet<>(objectives);
    }

    private String getCellAsString(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return null;
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> null;
        };
    }

    private double getCellAsNumeric(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return 0;
        }

        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> {
                try {
                    yield Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException exception) {
                    yield 0;
                }
            }
            default -> 0;
        };
    }

    private List<UUID> parseObjectiveIds(String objectiveIdsRaw, int rowNumber, ImportResultResponse result) {
        if (objectiveIdsRaw == null || objectiveIdsRaw.isBlank()) {
            return List.of();
        }

        String[] parts = objectiveIdsRaw.split(",");
        List<UUID> ids = new java.util.ArrayList<>();
        for (String part : parts) {
            String value = part.trim();
            if (value.isEmpty()) {
                continue;
            }
            try {
                ids.add(UUID.fromString(value));
            } catch (IllegalArgumentException exception) {
                result.addError(rowNumber, "learningObjectiveIds", "Invalid objective id: " + value);
                return null;
            }
        }
        return ids;
    }

    private TopicSessionResponse toResponse(TopicSession session) {
        List<UUID> learningObjectiveIds = session.getLearningObjectives()
                .stream()
                .map(TopicObjective::getId)
                .toList();

        return TopicSessionResponse.builder()
                .id(session.getId())
                .lessonId(session.getLesson().getId())
                .deliveryType(session.getDeliveryType())
                .trainingFormat(session.getTrainingFormat())
                .duration(session.getDuration())
                .sessionOrder(session.getSessionOrder())
                .learningObjectiveIds(learningObjectiveIds)
                .content(session.getContent())
                .note(session.getNote())
                .build();
    }
}
