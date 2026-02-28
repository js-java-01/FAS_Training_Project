package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course.dto.ObjectiveUpdateRequest;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseObjective;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.mapper.CourseObjectiveMapper;
import com.example.starter_project_2025.system.course.repository.CourseObjectiveRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.user.service.UserService;
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
public class CourseObjectiveServiceImpl implements CourseObjectiveService {
        private final CourseRepository courseRepository;
        private final CourseObjectiveRepository repository;
        private final CourseObjectiveMapper mapper;
        private final UserService userService;

        @Override
        public CourseObjectiveResponse create(
                        UUID courseId,
                        CourseObjectiveCreateRequest req) {

                Course course = courseRepository.findById(courseId)
                                .orElseThrow();

                // BUSINESS RULE 1:
                // Chỉ cho thêm objective khi course ở DRAFT
                if (course.getStatus() != CourseStatus.DRAFT) {
                        throw new RuntimeException(
                                        "Cannot add objective when course is not in DRAFT status");
                }

                // BUSINESS RULE 2:
                // Unique name trong cùng course
                if (repository.existsByCourseIdAndName(courseId, req.getName())) {
                        throw new RuntimeException(
                                        "Objective name already exists in this course");
                }

                CourseObjective objective = mapper.toEntity(req);
                objective.setCourse(course);

                return mapper.toResponse(repository.save(objective));
        }

        @Override
        public List<CourseObjectiveResponse> getByCourse(UUID courseId) {

                return repository.findByCourseId(courseId)
                                .stream()
                                .map(mapper::toResponse)
                                .toList();
        }

        public CourseObjectiveResponse updateObjective(
                        UUID courseId,
                        UUID objectiveId,
                        ObjectiveUpdateRequest request) {

                // Check course tồn tại
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

                // Check objective tồn tại
                CourseObjective objective = repository.findById(objectiveId)
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

                // Update data
                objective.setName(request.getName());
                objective.setDescription(request.getDescription());

                repository.save(objective);

                return mapper.toResponse(objective);
        }

        @Override
        public void deleteObjective(UUID courseId, UUID objectiveId) {

                CourseObjective objective = repository
                                .findById(objectiveId)
                                .orElseThrow(() -> new ResourceNotFoundException("Objective not found"));

                // Check objective thuộc course nào
                if (!objective.getCourse().getId().equals(courseId)) {
                        throw new BadRequestException("Objective does not belong to this course");
                }

                repository.delete(objective);
        }

        // ─── EXPORT ──────────────────────────────────────────────────────────────

        private static final String[] HEADERS = { "Name", "Description" };

        @Override
        public ResponseEntity<byte[]> exportObjectives(UUID courseId) {
                List<CourseObjective> objectives = repository.findByCourseId(courseId);

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
                        for (CourseObjective obj : objectives) {
                                Row row = sheet.createRow(rowIdx++);
                                row.createCell(0).setCellValue(obj.getName() != null ? obj.getName() : "");
                                row.createCell(1)
                                                .setCellValue(obj.getDescription() != null ? obj.getDescription() : "");
                        }
                        sheet.autoSizeColumn(0);
                        sheet.autoSizeColumn(1);

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
                        sample.createCell(0).setCellValue("Understand core Java concepts");
                        sample.createCell(1)
                                        .setCellValue("Student can explain OOP, collections, and exception handling");

                        sheet.autoSizeColumn(0);
                        sheet.autoSizeColumn(1);

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
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

                if (course.getStatus() == CourseStatus.ACTIVE) {
                        throw new RuntimeException("Course is not editable");
                }

                try (InputStream is = file.getInputStream();
                                Workbook wb = new XSSFWorkbook(is)) {

                        Sheet sheet = wb.getSheetAt(0);
                        Iterator<Row> rows = sheet.iterator();
                        if (!rows.hasNext())
                                return;
                        rows.next(); // skip header

                        while (rows.hasNext()) {
                                Row row = rows.next();

                                String name = getCellStr(row, 0);
                                if (name == null || name.isBlank())
                                        continue;

                                // Skip duplicates silently
                                if (repository.existsByCourseIdAndName(courseId, name))
                                        continue;

                                CourseObjective obj = new CourseObjective();
                                obj.setName(name);
                                obj.setDescription(getCellStr(row, 1));
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
}
