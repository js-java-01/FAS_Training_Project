package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.BatchCreateRequest;
import com.example.starter_project_2025.system.course.dto.LessonBatchItem;
import com.example.starter_project_2025.system.course.dto.SessionBatchItem;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseLesson;
import com.example.starter_project_2025.system.course.entity.Session;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.enums.SessionType;
import com.example.starter_project_2025.system.course.mapper.BatchOutlineMapper;
import com.example.starter_project_2025.system.course.repository.CourseLessonRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course.repository.SessionRepository;
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
public class BatchOutlineServiceImpl implements BatchOutlineService {

    private final CourseRepository courseRepository;
    private final CourseLessonRepository lessonRepository;
    private final SessionRepository sessionRepository;
    private final BatchOutlineMapper mapper;

    private static final String[] TEMPLATE_HEADERS = {
            "lessonName", "lessonDescription", "lessonDuration",
            "sessionTopic", "sessionType", "studentTasks", "sessionOrder"
    };

    @Override
    public void createBatch(BatchCreateRequest request) {

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // workflow check
        if (course.getStatus() == CourseStatus.ACTIVE) {
            throw new RuntimeException("Course is not editable");
        }

        int lessonIndex = 1;

        for (LessonBatchItem lessonItem : request.getLessons()) {

            CourseLesson lesson = mapper.toLesson(lessonItem, course, lessonIndex++);
            lessonRepository.save(lesson);

            if (lessonItem.getSessions() == null)
                continue;

            int sessionIndex = 1;

            for (SessionBatchItem sessionItem : lessonItem.getSessions()) {

                Session session = mapper.toSession(sessionItem, lesson, sessionIndex++);
                sessionRepository.save(session);
            }
        }
    }

    @Override
    public ResponseEntity<byte[]> exportOutline(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<CourseLesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Outline");

            // Header row
            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            int rowIdx = 1;
            for (CourseLesson lesson : lessons) {
                List<Session> sessions = sessionRepository.findByLessonIdOrderBySessionOrderAsc(lesson.getId());

                if (sessions.isEmpty()) {
                    // Write lesson row with no session
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(lesson.getLessonName());
                    row.createCell(1).setCellValue(lesson.getDescription() != null ? lesson.getDescription() : "");
                    row.createCell(2).setCellValue(lesson.getDuration() != null ? lesson.getDuration() : 0);
                    row.createCell(3).setCellValue("");
                    row.createCell(4).setCellValue("");
                    row.createCell(5).setCellValue("");
                    row.createCell(6).setCellValue("");
                } else {
                    for (Session session : sessions) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(lesson.getLessonName());
                        row.createCell(1).setCellValue(lesson.getDescription() != null ? lesson.getDescription() : "");
                        row.createCell(2).setCellValue(lesson.getDuration() != null ? lesson.getDuration() : 0);
                        row.createCell(3).setCellValue(session.getTopic() != null ? session.getTopic() : "");
                        row.createCell(4).setCellValue(session.getType() != null ? session.getType().name() : "");
                        row.createCell(5)
                                .setCellValue(session.getStudentTasks() != null ? session.getStudentTasks() : "");
                        row.createCell(6)
                                .setCellValue(session.getSessionOrder() != null ? session.getSessionOrder() : 0);
                    }
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            String filename = "outline_" + course.getCourseName().replaceAll("\\s+", "_") + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export outline", e);
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Outline");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            // Sample data
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("Lesson 1 - Introduction");
            sample.createCell(1).setCellValue("Introduction to the course");
            sample.createCell(2).setCellValue(120);
            sample.createCell(3).setCellValue("Overview");
            sample.createCell(4).setCellValue("VIDEO_LECTURE");
            sample.createCell(5).setCellValue("Watch the video and take notes");
            sample.createCell(6).setCellValue(1);

            Row sample2 = sheet.createRow(2);
            sample2.createCell(0).setCellValue("Lesson 1 - Introduction");
            sample2.createCell(1).setCellValue("Introduction to the course");
            sample2.createCell(2).setCellValue(120);
            sample2.createCell(3).setCellValue("Live Q&A");
            sample2.createCell(4).setCellValue("LIVE_SESSION");
            sample2.createCell(5).setCellValue("Prepare questions");
            sample2.createCell(6).setCellValue(2);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=outline_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate outline template", e);
        }
    }

    @Override
    public void importOutline(UUID courseId, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (course.getStatus() == CourseStatus.ACTIVE) {
            throw new RuntimeException("Course is not editable");
        }

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (!rows.hasNext())
                return;
            rows.next(); // skip header

            // Group rows by lesson name
            Map<String, LessonBatchItem> lessonMap = new LinkedHashMap<>();

            while (rows.hasNext()) {
                Row row = rows.next();

                String lessonName = getString(row, 0);
                if (lessonName == null || lessonName.isBlank())
                    continue;

                String lessonDesc = getString(row, 1);
                Integer lessonDuration = getInteger(row, 2);
                String sessionTopic = getString(row, 3);
                String sessionType = getString(row, 4);
                String studentTasks = getString(row, 5);
                Integer sessionOrder = getInteger(row, 6);

                LessonBatchItem lessonItem = lessonMap.computeIfAbsent(lessonName, k -> {
                    LessonBatchItem item = new LessonBatchItem();
                    item.setLessonName(k);
                    item.setDescription(lessonDesc);
                    item.setDuration(lessonDuration);
                    item.setSessions(new ArrayList<>());
                    return item;
                });

                if (sessionTopic != null && !sessionTopic.isBlank()) {
                    SessionBatchItem sessionItem = new SessionBatchItem();
                    sessionItem.setTopic(sessionTopic);
                    sessionItem.setStudentTasks(studentTasks);
                    sessionItem
                            .setSessionOrder(sessionOrder != null ? sessionOrder : lessonItem.getSessions().size() + 1);

                    if (sessionType != null && !sessionType.isBlank()) {
                        try {
                            sessionItem.setType(SessionType.valueOf(sessionType.toUpperCase().trim()));
                        } catch (IllegalArgumentException e) {
                            throw new RuntimeException("Invalid session type '" + sessionType
                                    + "' at row " + (row.getRowNum() + 1)
                                    + ". Valid values: VIDEO_LECTURE, LIVE_SESSION, QUIZ, ASSIGNMENT, PROJECT");
                        }
                    }

                    lessonItem.getSessions().add(sessionItem);
                }
            }

            // Create lessons and sessions
            BatchCreateRequest request = new BatchCreateRequest();
            request.setCourseId(courseId);
            request.setLessons(new ArrayList<>(lessonMap.values()));

            createBatch(request);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import outline", e);
        }
    }

    private String getString(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return null;
        if (cell.getCellType() == CellType.STRING)
            return cell.getStringCellValue().trim();
        if (cell.getCellType() == CellType.NUMERIC)
            return String.valueOf((int) cell.getNumericCellValue());
        return null;
    }

    private Integer getInteger(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return null;
        if (cell.getCellType() == CellType.NUMERIC)
            return (int) cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Integer.parseInt(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
