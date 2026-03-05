package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseObjectiveOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.ObjectiveUpdateOnlineRequest;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.entity.CourseObjectiveOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;
import com.example.starter_project_2025.system.course_online.mapper.CourseObjectiveOnlineMapper;
import com.example.starter_project_2025.system.course_online.repository.CourseObjectiveOnlineRepository;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.topic.entity.TopicObjective;
import com.example.starter_project_2025.system.topic.repository.TopicObjectiveRepository;
import com.example.starter_project_2025.system.user.service.UserService;
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
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseObjectiveOnlineServiceImpl implements CourseObjectiveOnlineService {
    private final CourseOnlineRepository courseRepository;
    private final CourseObjectiveOnlineRepository repository;
    private final CourseObjectiveOnlineMapper mapper;
    private final UserService userService;
    private final TopicObjectiveRepository topicObjectiveRepository;

    @Override
    public CourseObjectiveOnlineResponse create(
            UUID courseId,
            CourseObjectiveCreateOnlineRequest req) {

        CourseOnline course = courseRepository.findById(courseId)
                .orElseThrow();

        // BUSINESS RULE 1:
        // Chỉ cho thêm objective khi course ở DRAFT
        if (course.getStatus() != CourseStatusOnline.DRAFT) {
            throw new RuntimeException(
                    "Cannot add objective when course is not in DRAFT status");
        }

        // BUSINESS RULE 2:
        // Unique name trong cùng course
        if (repository.existsByCourseIdAndName(courseId, req.getName())) {
            throw new RuntimeException(
                    "Objective name already exists in this course");
        }
        // BUSINESS RULE 3: unique code trong cùng course
        if (repository.existsByCourseIdAndCode(courseId, req.getCode())) {
            throw new RuntimeException(
                    "Objective code already exists in this course");
        }

        CourseObjectiveOnline objective = mapper.toEntity(req);
        objective.setCourse(course);

        return mapper.toResponse(repository.save(objective));
    }

    @Override
    public List<CourseObjectiveOnlineResponse> getByCourse(UUID courseId) {

        return repository.findByCourseId(courseId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CourseObjectiveOnlineResponse updateObjective(
            UUID courseId,
            UUID objectiveId,
            ObjectiveUpdateOnlineRequest request) {

        // Check course tồn tại
        CourseOnline course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseOnline not found"));

        // Check objective tồn tại
        CourseObjectiveOnline objective = repository.findById(objectiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Objective not found"));

        // Validate objective thuộc course
        if (!objective.getCourse().getId().equals(course.getId())) {
            throw new BadRequestException("Objective does not belong to this course");
        }

        // Validate unique name trong cùng course (nếu yêu cầu)
        boolean exists = repository
                .existsByCourseIdAndNameAndIdNot(
                        courseId,
                        request.getName(),
                        objectiveId);

        if (exists) {
            throw new BadRequestException("Objective name already exists in this course");
        }

        boolean codeExists = repository
                .existsByCourseIdAndCodeAndIdNot(
                        courseId,
                        request.getCode(),
                        objectiveId);

        if (codeExists) {
            throw new BadRequestException("Objective code already exists in this course");
        }

        // Update data
        objective.setCode(request.getCode());
        objective.setName(request.getName());
        objective.setDescription(request.getDescription());

        repository.save(objective);

        return mapper.toResponse(objective);
    }

    @Override
    public void deleteObjective(UUID courseId, UUID objectiveId) {

        CourseObjectiveOnline objective = repository
                .findById(objectiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Objective not found"));

        // Check objective thuộc course nào
        if (!objective.getCourse().getId().equals(courseId)) {
            throw new BadRequestException("Objective does not belong to this course");
        }

        repository.delete(objective);
    }

    // ─── EXPORT ──────────────────────────────────────────────────────────────

    private static final String[] HEADERS = { "Code", "Name", "Description" };

    @Override
    public ResponseEntity<byte[]> exportObjectives(UUID courseId) {
        List<CourseObjectiveOnline> objectives = repository.findByCourseId(courseId);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Objectives");

            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (CourseObjectiveOnline obj : objectives) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(obj.getCode() != null ? obj.getCode() : "");
                row.createCell(1).setCellValue(obj.getName() != null ? obj.getName() : "");
                row.createCell(2).setCellValue(obj.getDescription() != null ? obj.getDescription() : "");
            }
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=objectives_export.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export objectives", e);
        }
    }

    // ─── TEMPLATE ────────────────────────────────────────────────────────────

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Objectives");

            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("OBJ-01");
            sample.createCell(1).setCellValue("Understand core Java concepts");
            sample.createCell(2).setCellValue("Student can explain OOP, collections, and exception handling");

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=objectives_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate objectives template", e);
        }
    }

    // ─── IMPORT ──────────────────────────────────────────────────────────────

    @Override
    public void importObjectives(UUID courseId, MultipartFile file) {

        CourseOnline course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseOnline not found"));

        if (course.getStatus() == CourseStatusOnline.ACTIVE) {
            throw new RuntimeException("CourseOnline is not editable");
        }

        try (InputStream is = file.getInputStream();
                Workbook wb = new XSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (!rows.hasNext()) {
                return; // empty file
            }

            rows.next(); // skip header row

            while (rows.hasNext()) {
                Row row = rows.next();

                String code = getCellStr(row, 0);
                String name = getCellStr(row, 1);
                String description = getCellStr(row, 2);

                // Validate required fields
                if (code == null || code.isBlank())
                    continue;
                if (name == null || name.isBlank())
                    continue;

                // Skip duplicate code
                if (repository.existsByCourseIdAndCode(courseId, code))
                    continue;

                // Skip duplicate name
                if (repository.existsByCourseIdAndName(courseId, name))
                    continue;

                CourseObjectiveOnline obj = new CourseObjectiveOnline();
                obj.setCode(code);
                obj.setName(name);
                obj.setDescription(description);
                obj.setCourse(course);

                repository.save(obj);
            }

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import objectives", e);
        }
    }

    private String getCellStr(Row row, int idx) {
        Cell cell = row.getCell(idx);
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> null;
        };
    }

    @Override
    @Transactional
    public void cloneFromTopic(UUID courseId, UUID topicId) {
        CourseOnline course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("CourseOnline not found"));

        // Delete all existing objectives for the course
        List<CourseObjectiveOnline> existing = repository.findByCourseId(courseId);
        repository.deleteAll(existing);
        repository.flush();

        // Clone from topic objectives
        List<TopicObjective> topicObjectives = topicObjectiveRepository.findByTopicId(topicId);
        for (TopicObjective topicObj : topicObjectives) {
            CourseObjectiveOnline courseObj = CourseObjectiveOnline.builder()
                    .code(topicObj.getCode())
                    .name(topicObj.getName())
                    .description(topicObj.getDetails())
                    .course(course)
                    .build();
            repository.save(courseObj);
        }
    }
}
