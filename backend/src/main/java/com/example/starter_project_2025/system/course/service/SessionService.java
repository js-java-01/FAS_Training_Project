package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course.dto.SessionRequest;
import com.example.starter_project_2025.system.course.dto.SessionResponse;
import com.example.starter_project_2025.system.course.entity.CourseLesson;

import com.example.starter_project_2025.system.course.entity.Session;
import com.example.starter_project_2025.system.course.repository.CourseLessonRepository;

import com.example.starter_project_2025.system.course.repository.SessionRepository;
import com.example.starter_project_2025.system.course.enums.SessionType;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final CourseLessonRepository lessonRepository;

    @PreAuthorize("hasAuthority('SESSION_CREATE') or hasRole('ADMIN')")
    public SessionResponse createSession(SessionRequest request) {
        if (sessionRepository.existsByLessonIdAndSessionOrder(request.getLessonId(), request.getSessionOrder())) {
            throw new BadRequestException("Thứ tự session đã tồn tại trong lesson này.");
        }

        CourseLesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", request.getLessonId()));

        Session session = new Session();
        mapRequestToEntity(request, session);
        session.setLesson(lesson);

        return convertToResponse(sessionRepository.save(session));
    }

    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN')")
    public SessionResponse updateSession(UUID id, SessionRequest request) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", id));

        mapRequestToEntity(request, session);

        if (request.getLessonId() != null && !request.getLessonId().equals(session.getLesson().getId())) {
            CourseLesson newLesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", request.getLessonId()));
            session.setLesson(newLesson);
        }

        return convertToResponse(sessionRepository.save(session));
    }

    @PreAuthorize("hasAuthority('SESSION_DELETE') or hasRole('ADMIN')")
    public void deleteSession(UUID id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Session", "id", id);
        }
        sessionRepository.deleteById(id);
    }

    public SessionResponse getSessionById(UUID id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", id));
        return convertToResponse(session);
    }

    public List<SessionResponse> getSessionsByLesson(UUID lessonId) {
        return sessionRepository.findByLessonIdOrderBySessionOrderAsc(lessonId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private static final String[] SESSION_HEADERS = {
            "Session Order", "Topic", "Type", "Student Tasks", "Duration (minutes)"
    };

    public ResponseEntity<byte[]> exportSessions(UUID lessonId) {
        List<Session> sessions = sessionRepository.findByLessonIdOrderBySessionOrderAsc(lessonId);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Sessions");

            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int i = 0; i < SESSION_HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(SESSION_HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Session s : sessions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(s.getSessionOrder() != null ? s.getSessionOrder() : 0);
                row.createCell(1).setCellValue(s.getTopic() != null ? s.getTopic() : "");
                row.createCell(2).setCellValue(s.getType() != null ? s.getType().name() : "");
                row.createCell(3).setCellValue(s.getStudentTasks() != null ? s.getStudentTasks() : "");
                row.createCell(4).setCellValue(s.getDuration() != null ? s.getDuration() : 0);
            }

            for (int i = 0; i < SESSION_HEADERS.length; i++)
                sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sessions_export.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export sessions", e);
        }
    }

    public ResponseEntity<byte[]> downloadSessionTemplate() {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Sessions");

            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < SESSION_HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(SESSION_HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue(1);
            sample.createCell(1).setCellValue("Introduction to Java");
            sample.createCell(2).setCellValue("VIDEO_LECTURE");
            sample.createCell(3).setCellValue("Read chapter 1");
            sample.createCell(4).setCellValue(90);

            for (int i = 0; i < SESSION_HEADERS.length; i++)
                sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sessions_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate sessions template", e);
        }
    }

    @PreAuthorize("hasAuthority('SESSION_CREATE') or hasRole('ADMIN')")
    public ImportResultResponse importSessions(UUID lessonId, MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();

        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        try (InputStream is = file.getInputStream();
                Workbook wb = new XSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            if (!rows.hasNext()) {
                result.buildMessage();
                return result;
            }
            rows.next(); // skip header

            while (rows.hasNext()) {
                Row row = rows.next();

                String topicVal = getCellStr(row, 1);
                if (topicVal == null || topicVal.isBlank())
                    continue;

                result.setTotalRows(result.getTotalRows() + 1);
                int displayRow = row.getRowNum() + 1;

                try {
                    int sessionOrderVal = (int) getNumericCell(row, 0);
                    if (sessionRepository.existsByLessonIdAndSessionOrder(lessonId, sessionOrderVal)) {
                        result.addError(displayRow, "sessionOrder", "Duplicate session order: " + sessionOrderVal);
                        continue;
                    }

                    String typeVal = getCellStr(row, 2);
                    String taskVal = getCellStr(row, 3);
                    int durationVal = (int) getNumericCell(row, 4);

                    Session session = new Session();
                    session.setLesson(lesson);
                    session.setSessionOrder(sessionOrderVal);
                    session.setTopic(topicVal);
                    session.setStudentTasks(taskVal);
                    session.setDuration(durationVal > 0 ? durationVal : null);
                    if (typeVal != null && !typeVal.isBlank()) {
                        try {
                            session.setType(SessionType.valueOf(typeVal.toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            result.addError(displayRow, "type", "Invalid session type: " + typeVal);
                            continue;
                        }
                    }

                    sessionRepository.save(session);
                    result.addSuccess();
                } catch (Exception e) {
                    result.addError(displayRow, "", e.getMessage());
                }
            }
        } catch (Exception e) {
            result.addError(0, "file", "Failed to import sessions: " + e.getMessage());
        }

        result.buildMessage();
        return result;
    }

    private String getCellStr(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> null;
        };
    }

    private double getNumericCell(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null)
            return 0;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> {
                try {
                    yield Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    yield 0;
                }
            }
            default -> 0;
        };
    }

    private void mapRequestToEntity(SessionRequest request, Session session) {
        session.setTopic(request.getTopic());
        session.setSessionOrder(request.getSessionOrder());
        session.setStudentTasks(request.getStudentTasks());
        session.setDuration(request.getDuration());
        if (request.getType() != null) {
            session.setType(SessionType.valueOf(request.getType().toUpperCase()));
        }
    }

    private SessionResponse convertToResponse(Session session) {
        SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setTopic(session.getTopic());
        response.setType(session.getType() != null ? session.getType().name() : null);
        response.setSessionOrder(session.getSessionOrder());
        response.setStudentTasks(session.getStudentTasks());
        response.setDuration(session.getDuration());
        response.setLessonId(session.getLesson().getId());
        return response;
    }
}