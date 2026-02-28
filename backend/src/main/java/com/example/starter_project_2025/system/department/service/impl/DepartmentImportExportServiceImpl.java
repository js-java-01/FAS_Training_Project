package com.example.starter_project_2025.system.department.service.impl;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.department.dto.DepartmentImportResult;
import com.example.starter_project_2025.system.department.entity.Department;
import com.example.starter_project_2025.system.department.repository.DepartmentRepository;
import com.example.starter_project_2025.system.department.service.DepartmentImportExportService;
import com.example.starter_project_2025.system.location.entity.Location;
import com.example.starter_project_2025.system.location.repository.LocationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentImportExportServiceImpl implements DepartmentImportExportService {

    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;

    // ================= EXPORT =================

    @Override
    public byte[] exportDepartments(String format) {

        List<Department> departments = departmentRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Departments");

            // Header
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Code");
            header.createCell(1).setCellValue("Name");
            header.createCell(2).setCellValue("Description");
            header.createCell(3).setCellValue("LocationName");

            int rowIdx = 1;

            for (Department dept : departments) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(dept.getCode());
                row.createCell(1).setCellValue(dept.getName());
                row.createCell(2).setCellValue(dept.getDescription());
                row.createCell(3).setCellValue(
                        dept.getLocation() != null
                                ? dept.getLocation().getName()
                                : "");
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error exporting departments", e);
        }
    }

    private byte[] exportToCSV(List<Department> departments) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                PrintWriter writer = new PrintWriter(out)) {

            writer.println("Name,Code,Description,LocationId");

            for (Department d : departments) {
                writer.printf("%s,%s,%s,%s%n",
                        d.getName(),
                        d.getCode(),
                        d.getDescription(),
                        d.getLocation() != null ? d.getLocation().getId() : "");
            }

            writer.flush();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error exporting CSV");
        }
    }

    private byte[] exportToExcel(List<Department> departments) {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Departments");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Name");
            header.createCell(1).setCellValue("Code");
            header.createCell(2).setCellValue("Description");
            header.createCell(3).setCellValue("LocationId");

            int rowIdx = 1;
            for (Department d : departments) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(d.getName());
                row.createCell(1).setCellValue(d.getCode());
                row.createCell(2).setCellValue(d.getDescription());
                row.createCell(3).setCellValue(
                        d.getLocation() != null ? d.getLocation().getId().toString() : "");
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error exporting Excel");
        }
    }

    // ================= IMPORT =================

    @Override
    @Transactional
    public ImportResultResponse importDepartments(MultipartFile file) {

        ImportResultResponse result = new ImportResultResponse();

        if (file == null || file.isEmpty()) {
            result.addError(0, "file", "No file uploaded");
            result.buildMessage();
            return result;
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                result.setTotalRows(result.getTotalRows() + 1);
                int displayRow = i + 1;

                try {

                    String code = getCellValue(row.getCell(0));
                    String name = getCellValue(row.getCell(1));
                    String description = getCellValue(row.getCell(2));
                    String locationName = getCellValue(row.getCell(3));

                    // ===== VALIDATE =====
                    if (code == null || code.isBlank()) {
                        result.addError(displayRow, "code", "Code is required");
                        continue;
                    }

                    if (name == null || name.isBlank()) {
                        result.addError(displayRow, "name", "Name is required");
                        continue;
                    }

                    // Check duplicate code
                    if (departmentRepository.existsByCode(code.trim())) {
                        result.addError(displayRow, "code", "Duplicate code: " + code.trim());
                        continue;
                    }

                    Department department = new Department();
                    department.setCode(code.trim());
                    department.setName(name.trim());
                    department.setDescription(description);

                    // ===== LOCATION =====
                    if (locationName != null && !locationName.isBlank()) {
                        Location location = locationRepository
                                .findByName(locationName.trim())
                                .orElseThrow(() -> new RuntimeException("Location not found: " + locationName.trim()));
                        department.setLocation(location);
                    }

                    departmentRepository.save(department);
                    result.addSuccess();

                } catch (Exception e) {
                    result.addError(displayRow, "", e.getMessage());
                }
            }

        } catch (Exception e) {
            result.addError(0, "file", "File error: " + e.getMessage());
        }

        result.buildMessage();
        return result;
    }

    private void importCSV(MultipartFile file, DepartmentImportResult result) throws Exception {

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()));

        String line;
        reader.readLine(); // skip header

        while ((line = reader.readLine()) != null) {
            try {
                String[] parts = line.split(",");

                Department dept = new Department();
                dept.setName(parts[0]);
                dept.setCode(parts[1]);
                dept.setDescription(parts[2]);

                if (parts.length > 3 && !parts[3].isEmpty()) {
                    Location location = locationRepository.findById(UUID.fromString(parts[3]))
                            .orElseThrow(() -> new RuntimeException("Invalid location"));
                    dept.setLocation(location);
                }

                departmentRepository.save(dept);
                result.addSuccess();

            } catch (Exception e) {
                result.addError("Row error: " + e.getMessage());
            }
        }
    }

    private void importExcel(MultipartFile file, DepartmentImportResult result) throws Exception {

        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {

            try {
                Row row = sheet.getRow(i);

                Department dept = new Department();
                dept.setName(row.getCell(0).getStringCellValue());
                dept.setCode(row.getCell(1).getStringCellValue());
                dept.setDescription(row.getCell(2).getStringCellValue());

                String locationId = row.getCell(3).getStringCellValue();
                if (!locationId.isEmpty()) {
                    Location location = locationRepository.findById(UUID.fromString(locationId))
                            .orElseThrow(() -> new RuntimeException("Invalid location"));
                    dept.setLocation(location);
                }

                departmentRepository.save(dept);
                result.addSuccess();

            } catch (Exception e) {
                result.addError("Row " + i + " error: " + e.getMessage());
            }
        }

        workbook.close();
    }

    // ================= TEMPLATE =================

    @Override
    public byte[] downloadImportTemplate() {

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Departments");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Code");
            header.createCell(1).setCellValue("Name");
            header.createCell(2).setCellValue("Description");
            header.createCell(3).setCellValue("LocationName");

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error creating template", e);
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

}
