package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.dto.TopicAiPreviewLessonResponse;
import com.example.starter_project_2025.system.topic.dto.TopicAiPreviewSessionResponse;
import com.example.starter_project_2025.system.topic.dto.TopicApplyAiPreviewRequest;
import com.example.starter_project_2025.system.topic.dto.TopicBatchCreateRequest;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import com.example.starter_project_2025.system.topic.entity.TopicSession;
import com.example.starter_project_2025.system.topic.repository.TopicLessonRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic.repository.TopicSessionRepository;
import jakarta.transaction.Transactional;
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
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicBatchOutlineServiceImpl implements TopicBatchOutlineService {

    private final TopicRepository topicRepository;
    private final TopicLessonRepository topicLessonRepository;
    private final TopicSessionRepository topicSessionRepository;
    private final TopicAiService topicAiService;

    private static final String[] TEMPLATE_HEADERS = {
            "lessonName", "lessonDescription",
            "sessionDeliveryType", "sessionContent", "sessionDuration", "sessionNote", "sessionOrder"
    };

    // ─── Create Batch ────────────────────────────────────────────────────────────

    @Override
    public void createBatch(TopicBatchCreateRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found: " + request.getTopicId()));

        int lessonOrder = (int) topicLessonRepository.countByTopicId(topic.getId()) + 1;

        for (TopicBatchCreateRequest.LessonItem lessonItem : request.getLessons()) {
            if (lessonItem.getLessonName() == null || lessonItem.getLessonName().isBlank())
                continue;

            TopicLesson lesson = TopicLesson.builder()
                    .lessonName(lessonItem.getLessonName().trim())
                    .description(lessonItem.getDescription())
                    .topic(topic)
                    .lessonOrder(lessonOrder++)
                    .build();
            topicLessonRepository.save(lesson);

            if (lessonItem.getSessions() == null)
                continue;

            int sessionOrder = 1;
            for (TopicBatchCreateRequest.SessionItem sessionItem : lessonItem.getSessions()) {
                if (sessionItem.getDeliveryType() == null || sessionItem.getDeliveryType().isBlank())
                    continue;

                TopicSession session = TopicSession.builder()
                        .lesson(lesson)
                        .deliveryType(sessionItem.getDeliveryType())
                        .content(sessionItem.getContent())
                        .note(sessionItem.getNote())
                        .duration(sessionItem.getDuration() != null ? sessionItem.getDuration() : 60)
                        .sessionOrder(
                                sessionItem.getSessionOrder() != null ? sessionItem.getSessionOrder() : sessionOrder)
                        .build();
                topicSessionRepository.save(session);
                sessionOrder++;
            }
        }
    }

    // ─── Export ─────────────────────────────────────────────────────────────────

    @Override
    public ResponseEntity<byte[]> exportOutline(UUID topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        List<TopicLesson> lessons = topicLessonRepository.findByTopicIdOrderByLessonOrderAsc(topicId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Outline");

            // Header style
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(boldFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(TEMPLATE_HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (TopicLesson lesson : lessons) {
                List<TopicSession> sessions = topicSessionRepository
                        .findByLessonIdOrderBySessionOrderAsc(lesson.getId());

                if (sessions.isEmpty()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(lesson.getLessonName() != null ? lesson.getLessonName() : "");
                    row.createCell(1).setCellValue(lesson.getDescription() != null ? lesson.getDescription() : "");
                    row.createCell(2).setCellValue("");
                    row.createCell(3).setCellValue("");
                    row.createCell(4).setCellValue("");
                    row.createCell(5).setCellValue("");
                    row.createCell(6).setCellValue("");
                } else {
                    for (TopicSession session : sessions) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(lesson.getLessonName() != null ? lesson.getLessonName() : "");
                        row.createCell(1).setCellValue(lesson.getDescription() != null ? lesson.getDescription() : "");
                        row.createCell(2)
                                .setCellValue(session.getDeliveryType() != null ? session.getDeliveryType() : "");
                        row.createCell(3).setCellValue(session.getContent() != null ? session.getContent() : "");
                        row.createCell(4).setCellValue(session.getDuration() != null ? session.getDuration() : 0);
                        row.createCell(5).setCellValue(session.getNote() != null ? session.getNote() : "");
                        row.createCell(6)
                                .setCellValue(session.getSessionOrder() != null ? session.getSessionOrder() : 0);
                    }
                }
            }

            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            String filename = "topic_outline_" + topicId + ".xlsx";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export topic outline", e);
        }
    }

    // ─── Template ────────────────────────────────────────────────────────────────

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Outline");

            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(boldFont);

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(TEMPLATE_HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample row 1 — lesson with first session
            Row sample1 = sheet.createRow(1);
            sample1.createCell(0).setCellValue("Lesson 1 - Introduction");
            sample1.createCell(1).setCellValue("Overview of the topic");
            sample1.createCell(2).setCellValue("VIDEO_LECTURE");
            sample1.createCell(3).setCellValue("Introduction video content");
            sample1.createCell(4).setCellValue(60);
            sample1.createCell(5).setCellValue("Watch and take notes");
            sample1.createCell(6).setCellValue(1);

            // Sample row 2 — same lesson, second session
            Row sample2 = sheet.createRow(2);
            sample2.createCell(0).setCellValue("Lesson 1 - Introduction");
            sample2.createCell(1).setCellValue("Overview of the topic");
            sample2.createCell(2).setCellValue("LIVE_SESSION");
            sample2.createCell(3).setCellValue("Live Q&A session");
            sample2.createCell(4).setCellValue(30);
            sample2.createCell(5).setCellValue("Prepare questions");
            sample2.createCell(6).setCellValue(2);

            // Sample row 3 — second lesson
            Row sample3 = sheet.createRow(3);
            sample3.createCell(0).setCellValue("Lesson 2 - Deep Dive");
            sample3.createCell(1).setCellValue("Advanced concepts");
            sample3.createCell(2).setCellValue("ASSIGNMENT");
            sample3.createCell(3).setCellValue("Hands-on assignment");
            sample3.createCell(4).setCellValue(90);
            sample3.createCell(5).setCellValue("Submit by end of week");
            sample3.createCell(6).setCellValue(1);

            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=topic_outline_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate topic outline template", e);
        }
    }

    // ─── Import ──────────────────────────────────────────────────────────────────

    @Override
    public ImportResultResponse importOutline(UUID topicId, MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (!rows.hasNext()) {
                result.buildMessage();
                return result;
            }
            rows.next(); // skip header

            // Track lesson order counter
            int nextLessonOrder = (int) topicLessonRepository.countByTopicId(topicId) + 1;

            // Track lessons created/found in this import run (by name)
            Map<String, TopicLesson> savedLessons = new LinkedHashMap<>();
            // Track session count per lesson id for auto order
            Map<UUID, Integer> sessionCountCache = new HashMap<>();

            while (rows.hasNext()) {
                Row row = rows.next();
                result.setTotalRows(result.getTotalRows() + 1);
                int displayRow = row.getRowNum() + 1;

                try {
                    String lessonName = getString(row, 0);
                    if (lessonName == null || lessonName.isBlank()) {
                        result.setTotalRows(result.getTotalRows() - 1);
                        continue;
                    }

                    // Get or create the TopicLesson for this row's lesson name
                    TopicLesson lesson;
                    if (savedLessons.containsKey(lessonName)) {
                        lesson = savedLessons.get(lessonName);
                    } else {
                        // Block if lesson name already exists in DB for this topic
                        if (topicLessonRepository.existsByTopicIdAndLessonName(topicId, lessonName)) {
                            result.addError(displayRow, "lessonName",
                                    "Lesson already exists in this topic: " + lessonName);
                            continue;
                        }
                        String desc = getString(row, 1);
                        TopicLesson newLesson = TopicLesson.builder()
                                .topic(topic)
                                .lessonName(lessonName)
                                .description(desc)
                                .lessonOrder(nextLessonOrder++)
                                .build();
                        lesson = topicLessonRepository.save(newLesson);
                        savedLessons.put(lessonName, lesson);
                        // Initialise session count from DB for this lesson
                        sessionCountCache.put(lesson.getId(),
                                topicSessionRepository.findByLessonIdOrderBySessionOrderAsc(lesson.getId()).size());
                    }

                    // Session columns
                    String deliveryType = getString(row, 2);
                    String content = getString(row, 3);
                    Integer duration = getInteger(row, 4);
                    String note = getString(row, 5);
                    Integer sessionOrder = getInteger(row, 6);

                    if (deliveryType != null && !deliveryType.isBlank()) {
                        int sessionCount = sessionCountCache.getOrDefault(lesson.getId(), 0);
                        TopicSession session = TopicSession.builder()
                                .lesson(lesson)
                                .deliveryType(deliveryType.toUpperCase().trim())
                                .content(content)
                                .duration(duration != null ? duration : 60)
                                .note(note)
                                .sessionOrder(sessionOrder != null ? sessionOrder : sessionCount + 1)
                                .build();
                        topicSessionRepository.save(session);
                        sessionCountCache.put(lesson.getId(), sessionCount + 1);
                    }

                    result.addSuccess();
                } catch (Exception e) {
                    result.addError(displayRow, "", e.getMessage());
                }
            }

        } catch (Exception e) {
            result.addError(0, "file", "Failed to import outline: " + e.getMessage());
        }

        result.buildMessage();
        return result;
    }

    // ─── AI Preview ──────────────────────────────────────────────────────────────

    @Override
    public List<TopicAiPreviewLessonResponse> generateAiPreview(UUID topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));
        return topicAiService.generatePreview(topic);
    }

    @Override
    public void applyAiPreview(UUID topicId, TopicApplyAiPreviewRequest request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        // Remove existing lessons and sessions
        List<TopicLesson> existingLessons = topicLessonRepository.findByTopicIdOrderByLessonOrderAsc(topicId);
        for (TopicLesson lesson : existingLessons) {
            List<TopicSession> sessions = topicSessionRepository.findByLessonIdOrderBySessionOrderAsc(lesson.getId());
            topicSessionRepository.deleteAll(sessions);
        }
        topicLessonRepository.deleteAll(existingLessons);

        if (request.getLessons() == null)
            return;

        int lessonOrder = 1;
        for (TopicAiPreviewLessonResponse lessonDto : request.getLessons()) {
            TopicLesson lesson = TopicLesson.builder()
                    .lessonName(lessonDto.getName())
                    .description(lessonDto.getDescription())
                    .topic(topic)
                    .lessonOrder(lessonOrder++)
                    .build();
            topicLessonRepository.save(lesson);

            if (lessonDto.getSessions() == null)
                continue;

            int sessionOrder = 1;
            for (TopicAiPreviewSessionResponse sessionDto : lessonDto.getSessions()) {
                TopicSession session = TopicSession.builder()
                        .deliveryType(sessionDto.getDeliveryType())
                        .content(sessionDto.getContent())
                        .note(sessionDto.getNote())
                        .duration(sessionDto.getDuration() != null ? sessionDto.getDuration() : 60)
                        .lesson(lesson)
                        .sessionOrder(sessionDto.getOrder() != null ? sessionDto.getOrder() : sessionOrder)
                        .build();
                topicSessionRepository.save(session);
                sessionOrder++;
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private String getString(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            default -> null;
        };
    }

    private Integer getInteger(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case NUMERIC -> (int) cell.getNumericCellValue();
            case STRING -> {
                try {
                    yield Integer.parseInt(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    yield null;
                }
            }
            default -> null;
        };
    }
}
