package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseObjective;
import com.example.starter_project_2025.system.course.repository.CourseObjectiveRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ObjectiveExcelService {

    private final CourseObjectiveRepository repository;
    private final CourseRepository courseRepository;

    // ===============================
    // 1. DOWNLOAD TEMPLATE
    // ===============================
    public byte[] generateTemplate() throws IOException {

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Objectives");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Code");
        header.createCell(1).setCellValue("Name");
        header.createCell(2).setCellValue("Description");

        autoSize(sheet, 3);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return out.toByteArray();
    }

    // ===============================
    // 2. EXPORT OBJECTIVES
    // ===============================
    public byte[] exportObjectives(UUID courseId) throws IOException {

        List<CourseObjective> objectives =
                repository.findByCourse_Id(courseId);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Objectives");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Code");
        header.createCell(1).setCellValue("Name");
        header.createCell(2).setCellValue("Description");

        int rowIdx = 1;
        for (CourseObjective obj : objectives) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(obj.getCode());
            row.createCell(1).setCellValue(obj.getName());
            row.createCell(2).setCellValue(obj.getDescription());
        }

        autoSize(sheet, 3);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return out.toByteArray();
    }

    // ===============================
    // 3. IMPORT OBJECTIVES
    // ===============================
    public void importObjectives(String courseId, MultipartFile file) throws IOException {

        Course course = courseRepository.findById(UUID.fromString(courseId))
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (Row row : sheet) {

            if (row.getRowNum() == 0) continue; // skip header

            String code = getCellValue(row.getCell(0));
            String name = getCellValue(row.getCell(1));
            String description = getCellValue(row.getCell(2));

            if (code == null || code.isBlank()) continue;
            if (name == null || name.isBlank()) continue;

            // Skip duplicate code
            if (repository.existsByCourseIdAndCode(course.getId(), code)) continue;

            // Skip duplicate name
            if (repository.existsByCourseIdAndName(course.getId(), name)) continue;

            CourseObjective objective = new CourseObjective();
            objective.setCode(code);
            objective.setName(name);
            objective.setDescription(description);
            objective.setCourse(course);

            repository.save(objective);
        }

        workbook.close();
    }

    private String getCellValue(Cell cell) {

        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private void autoSize(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}