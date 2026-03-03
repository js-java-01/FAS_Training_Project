package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.dto.TopicLessonCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicLessonResponse;
import com.example.starter_project_2025.system.topic.dto.TopicLessonUpdateRequest;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import com.example.starter_project_2025.system.topic.mapper.TopicLessonMapper;
import com.example.starter_project_2025.system.topic.repository.TopicLessonRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicLessonServiceImpl implements TopicLessonService {

    private static final String[] LESSON_HEADERS = {
            "Lesson Order",
            "Lesson Name",
            "Description"
    };

    private final TopicLessonRepository topicLessonRepository;
    private final TopicRepository topicRepository;
    private final TopicLessonMapper topicLessonMapper;

    // ─── 3.2.17.19 View Topic Outline ───────────────────────────────────
    @Override
    public List<TopicLessonResponse> getLessonsByTopicId(UUID topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new RuntimeException("Topic not found: " + topicId);
        }
        return topicLessonRepository.findByTopicIdOrderByLessonOrderAsc(topicId)
                .stream()
                .map(topicLessonMapper::toResponse)
                .toList();
    }

    // ─── 3.2.17.20 Add Topic Outline (Create Lesson) ────────────────────
    @Override
    public TopicLessonResponse create(UUID topicId, TopicLessonCreateRequest request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        // Assign order = count of existing lessons + 1
        long existingCount = topicLessonRepository.countByTopicId(topicId);
        int order = (int) (existingCount + 1);

        TopicLesson lesson = TopicLesson.builder()
                .lessonName(request.getLessonName())
                .description(request.getDescription())
                .lessonOrder(order)
                .topic(topic)
                .build();

        TopicLesson saved = topicLessonRepository.save(lesson);
        return topicLessonMapper.toResponse(saved);
    }

    // ─── Update Lesson ───────────────────────────────────────────────────
    @Override
    public TopicLessonResponse update(UUID topicId, UUID lessonId, TopicLessonUpdateRequest request) {
        TopicLesson lesson = topicLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        if (!lesson.getTopic().getId().equals(topicId)) {
            throw new RuntimeException("Lesson does not belong to topic: " + topicId);
        }

        if (request.getLessonName() != null && !request.getLessonName().isBlank()) {
            lesson.setLessonName(request.getLessonName());
        }
        if (request.getDescription() != null) {
            lesson.setDescription(request.getDescription());
        }

        TopicLesson saved = topicLessonRepository.save(lesson);
        return topicLessonMapper.toResponse(saved);
    }

    // ─── Delete Lesson ───────────────────────────────────────────────────
    @Override
    public void delete(UUID topicId, UUID lessonId) {
        TopicLesson lesson = topicLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        if (!lesson.getTopic().getId().equals(topicId)) {
            throw new RuntimeException("Lesson does not belong to topic: " + topicId);
        }

        topicLessonRepository.deleteById(lessonId);
    }

    @Override
    public ResponseEntity<byte[]> exportLessons(UUID topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new RuntimeException("Topic not found: " + topicId);
        }

        List<TopicLesson> lessons = topicLessonRepository.findByTopicIdOrderByLessonOrderAsc(topicId);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Topic Lessons");

            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int columnIndex = 0; columnIndex < LESSON_HEADERS.length; columnIndex++) {
                Cell cell = header.createCell(columnIndex);
                cell.setCellValue(LESSON_HEADERS[columnIndex]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (TopicLesson lesson : lessons) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(lesson.getLessonOrder() != null ? lesson.getLessonOrder() : 0);
                row.createCell(1).setCellValue(lesson.getLessonName() != null ? lesson.getLessonName() : "");
                row.createCell(2).setCellValue(lesson.getDescription() != null ? lesson.getDescription() : "");
            }

            for (int columnIndex = 0; columnIndex < LESSON_HEADERS.length; columnIndex++) {
                sheet.autoSizeColumn(columnIndex);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=topic_lessons_" + topicId + ".xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(outputStream.toByteArray());
        } catch (Exception exception) {
            throw new RuntimeException("Failed to export topic lessons", exception);
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadLessonTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Topic Lessons");

            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);

            Row header = sheet.createRow(0);
            for (int columnIndex = 0; columnIndex < LESSON_HEADERS.length; columnIndex++) {
                Cell cell = header.createCell(columnIndex);
                cell.setCellValue(LESSON_HEADERS[columnIndex]);
                cell.setCellStyle(headerStyle);
            }

            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue(1);
            sample.createCell(1).setCellValue("Introduction");
            sample.createCell(2).setCellValue("Overview lesson");

            for (int columnIndex = 0; columnIndex < LESSON_HEADERS.length; columnIndex++) {
                sheet.autoSizeColumn(columnIndex);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=topic_lessons_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(outputStream.toByteArray());
        } catch (Exception exception) {
            throw new RuntimeException("Failed to generate lesson template", exception);
        }
    }

    @Override
    public ImportResultResponse importLessons(UUID topicId, MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        int nextOrder = (int) topicLessonRepository.countByTopicId(topicId) + 1;

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

                String lessonName = getCellAsString(row, 1);
                if (lessonName == null || lessonName.isBlank()) {
                    continue;
                }

                result.setTotalRows(result.getTotalRows() + 1);
                int displayRow = row.getRowNum() + 1;

                try {
                    Integer order = parseLessonOrder(row.getCell(0));
                    if (order == null || order <= 0) {
                        order = nextOrder;
                    }

                    TopicLesson lesson = TopicLesson.builder()
                            .topic(topic)
                            .lessonName(lessonName.trim())
                            .description(getCellAsString(row, 2))
                            .lessonOrder(order)
                            .build();

                    topicLessonRepository.save(lesson);
                    result.addSuccess();
                    nextOrder = Math.max(nextOrder, order + 1);
                } catch (Exception exception) {
                    result.addError(displayRow, "", exception.getMessage());
                }
            }
        } catch (Exception exception) {
            result.addError(0, "file", "Failed to import lessons: " + exception.getMessage());
        }

        result.buildMessage();
        return result;
    }

    private String getCellAsString(Cell cell) {
        if (cell == null) {
            return null;
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> null;
        };
    }

    private Integer parseLessonOrder(Cell cell) {
        if (cell == null) {
            return null;
        }
        return switch (cell.getCellType()) {
            case NUMERIC -> (int) cell.getNumericCellValue();
            case STRING -> {
                try {
                    yield Integer.parseInt(cell.getStringCellValue().trim());
                } catch (NumberFormatException exception) {
                    yield null;
                }
            }
            default -> null;
        };
    }

    private String getCellAsString(Row row, int columnIndex) {
        return getCellAsString(row.getCell(columnIndex));
    }
}
