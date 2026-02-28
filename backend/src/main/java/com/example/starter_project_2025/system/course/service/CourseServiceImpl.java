package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.dto.CourseUpdateRequest;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.mapper.CourseMapper;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMapper mapper;
    private final UserService userService;

    @Override
    public CourseResponse create(CourseCreateRequest req) {
        Course course = mapper.toEntity(req);
        // if (req.getTrainerId() != null) {
        // course.setTrainer(userRepository.findById(req.getTrainerId()).orElseThrow());
        // }
        course.setCreator(userService.getCurrentUser());
        return mapper.toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse update(UUID id, CourseUpdateRequest req) {
        Course course = courseRepository.findById(id).orElseThrow();
        if (req.getCourseName() != null)
            course.setCourseName(req.getCourseName());
        if (req.getPrice() != null)
            course.setPrice(req.getPrice());
        if (req.getDiscount() != null)
            course.setDiscount(req.getDiscount());
        if (req.getLevel() != null)
            course.setLevel(req.getLevel());
        if (req.getEstimatedTime() != null)
            course.setEstimatedTime(req.getEstimatedTime());
        if (req.getNote() != null)
            course.setNote(req.getNote());
        if (req.getDescription() != null)
            course.setDescription(req.getDescription());
        if (req.getStatus() != null)
            course.setStatus(req.getStatus());
        if (req.getTrainerId() != null) {
            // course.setTrainer(userRepository.findById(req.getTrainerId()).orElseThrow());
        }
        course.setUpdater(userService.getCurrentUser());
        return mapper.toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse getById(UUID id) {
        return mapper.toResponse(courseRepository.findById(id).orElseThrow());
    }

    @Override
    public Page<CourseResponse> getAll(String keyword, String status, String trainerId, Pageable pageable) {
        com.example.starter_project_2025.system.course.enums.CourseStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = com.example.starter_project_2025.system.course.enums.CourseStatus
                        .valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        java.util.UUID trainerUuid = null;
        if (trainerId != null && !trainerId.isBlank()) {
            try {
                trainerUuid = java.util.UUID.fromString(trainerId);
            } catch (IllegalArgumentException ignored) {
            }
        }
        String kw = (keyword != null && !keyword.isBlank()) ? keyword : null;
        return courseRepository.findAllByFilters(kw, statusEnum, trainerUuid, pageable).map(mapper::toResponse);
    }

    @Override
    public void delete(UUID id) {
        courseRepository.deleteById(id);
    }

    // ─── EXPORT ──────────────────────────────────────────────────────────────
    @Override
    @PreAuthorize("hasAuthority('COURSE_EXPORT')")
    public ByteArrayInputStream exportCourses() throws IOException {
        // Columns match the import template (no ID column)
        String[] columns = { "Course Name", "Course Code", "Level", "Status",
                "Estimated Time (min)", "Price", "Discount (%)", "Trainer Email", "Description", "Note" };

        List<Course> courses = courseRepository.findAll();

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Courses");

            // Header style
            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Course c : courses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(c.getCourseName() != null ? c.getCourseName() : "");
                row.createCell(1).setCellValue(c.getCourseCode() != null ? c.getCourseCode() : "");
                row.createCell(2).setCellValue(c.getLevel() != null ? c.getLevel().name() : "");
                row.createCell(3).setCellValue(c.getStatus() != null ? c.getStatus().name() : "");
                row.createCell(4).setCellValue(c.getEstimatedTime() != null ? c.getEstimatedTime() : 0);
                row.createCell(5).setCellValue(c.getPrice() != null ? c.getPrice().doubleValue() : 0);
                row.createCell(6).setCellValue(c.getDiscount() != null ? c.getDiscount() : 0);
                // row.createCell(7).setCellValue(c.getTrainer() != null ?
                // c.getTrainer().getEmail() : "");
                row.createCell(8).setCellValue(c.getDescription() != null ? c.getDescription() : "");
                row.createCell(9).setCellValue(c.getNote() != null ? c.getNote() : "");
            }
            for (int i = 0; i < columns.length; i++)
                sheet.autoSizeColumn(i);

            wb.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ─── TEMPLATE ────────────────────────────────────────────────────────────
    @Override
    public ByteArrayInputStream downloadTemplate() throws IOException {
        String[] columns = { "Course Name", "Course Code", "Level", "Status",
                "Estimated Time (min)", "Price", "Discount (%)", "Trainer Email", "Description", "Note" };

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Courses Template");

            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(bold);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample row
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("Java Spring Boot");
            sample.createCell(1).setCellValue("JAVA-01");
            sample.createCell(2).setCellValue("BEGINNER"); // BEGINNER|INTERMEDIATE|ADVANCED
            sample.createCell(3).setCellValue("DRAFT"); // DRAFT|UNDER_REVIEW|ACTIVE
            sample.createCell(4).setCellValue(120);
            sample.createCell(5).setCellValue(5000000);
            sample.createCell(6).setCellValue(10);
            sample.createCell(7).setCellValue("trainer@example.com");
            sample.createCell(8).setCellValue("Course description");
            sample.createCell(9).setCellValue("Note");

            for (int i = 0; i < columns.length; i++)
                sheet.autoSizeColumn(i);

            wb.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ─── IMPORT ──────────────────────────────────────────────────────────────
    @Override
    @PreAuthorize("hasAuthority('COURSE_IMPORT')")
    public ImportResultResponse importCourses(MultipartFile file) throws IOException {
        ImportResultResponse result = new ImportResultResponse();

        if (file == null || file.isEmpty()) {
            result.addError(0, "file", "File is empty or missing");
            result.buildMessage();
            return result;
        }

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            User currentUser = userService.getCurrentUser();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String name = getCellValue(row.getCell(0));
                String code = getCellValue(row.getCell(1));
                if (name == null || name.isBlank() || code == null || code.isBlank())
                    continue;

                int rowNum = i + 1;
                result.setTotalRows(result.getTotalRows() + 1);

                if (courseRepository.existsByCourseCode(code)) {
                    result.addError(rowNum, "courseCode", "Course code already exists: " + code);
                    continue;
                }

                Course course = new Course();
                course.setCourseName(name);
                course.setCourseCode(code);

                String levelStr = getCellValue(row.getCell(2));
                if (levelStr != null && !levelStr.isBlank()) {
                    try {
                        course.setLevel(CourseLevel.valueOf(levelStr.trim().toUpperCase()));
                    } catch (IllegalArgumentException ignored) {
                    }
                }

                String statusStr = getCellValue(row.getCell(3));
                if (statusStr != null && !statusStr.isBlank()) {
                    try {
                        course.setStatus(CourseStatus.valueOf(statusStr.trim().toUpperCase()));
                    } catch (IllegalArgumentException ignored) {
                        course.setStatus(CourseStatus.DRAFT);
                    }
                } else {
                    course.setStatus(CourseStatus.DRAFT);
                }

                String estTimeStr = getCellValue(row.getCell(4));
                if (estTimeStr != null && !estTimeStr.isBlank()) {
                    try {
                        course.setEstimatedTime(Integer.parseInt(estTimeStr.trim()));
                    } catch (NumberFormatException ignored) {
                    }
                }

                String priceStr = getCellValue(row.getCell(5));
                if (priceStr != null && !priceStr.isBlank()) {
                    try {
                        course.setPrice(new BigDecimal(priceStr.trim()));
                    } catch (NumberFormatException ignored) {
                    }
                }

                String discountStr = getCellValue(row.getCell(6));
                if (discountStr != null && !discountStr.isBlank()) {
                    try {
                        course.setDiscount(Double.parseDouble(discountStr.trim()));
                    } catch (NumberFormatException ignored) {
                    }
                }

                String trainerEmail = getCellValue(row.getCell(7));
                if (trainerEmail != null && !trainerEmail.isBlank()) {
                    // userRepository.findByEmail(trainerEmail.trim())
                    // .ifPresent(course::setTrainer);
                }

                String description = getCellValue(row.getCell(8));
                if (description != null && !description.isBlank())
                    course.setDescription(description);

                String note = getCellValue(row.getCell(9));
                if (note != null && !note.isBlank())
                    course.setNote(note);

                course.setCreator(currentUser);
                courseRepository.save(course);
                result.addSuccess();
            }
        }

        result.buildMessage();
        return result;
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
