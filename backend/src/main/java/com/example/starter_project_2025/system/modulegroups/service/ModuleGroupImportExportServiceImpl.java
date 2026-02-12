package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportErrorDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
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

@Service
@RequiredArgsConstructor
public class ModuleGroupImportExportServiceImpl implements ModuleGroupImportExportService {

    private final ModuleGroupsRepository repository;
    private static final String NAME_REGEX = "^[A-Za-z\\s]+$";

    private static final String[] TEMPLATE_HEADERS =
            {"name", "description", "displayOrder", "isActive"};

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("ModuleGroups");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=module-groups-template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template", e);
        }
    }

    @Override
    public ImportResultResponse importExcel(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (!file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
            throw new RuntimeException("Invalid file format. Only .xlsx is allowed");
        }

        ImportResultResponse result = new ImportResultResponse();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (!rows.hasNext()) {
                throw new RuntimeException("File is empty");
            }

            Row header = rows.next();
            if (header.getPhysicalNumberOfCells() != 4) {
                throw new RuntimeException("Invalid template format");
            }

            int rowIndex = 1;

            while (rows.hasNext()) {
                Row row = rows.next();
                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    String name = getString(row, 0);
                    String description = getString(row, 1);
                    Integer displayOrder = getInteger(row, 2, 0);
                    Boolean isActive = getBoolean(row, 3, true);

                    if (name == null || name.isBlank()) {
                        throw new IllegalArgumentException("name|Name is required");
                    }

                    // chỉ cho phép chữ + khoảng trắng
                    if (!name.matches("^[A-Za-z\\s]+$")) {
                        throw new IllegalArgumentException("name|Only letters and spaces are allowed");
                    }

                    // check trùng (case insensitive)
                    if (repository.existsByNameIgnoreCase(name.trim())) {
                        throw new IllegalArgumentException("name|Name already exists");
                    }

                    ModuleGroups group = new ModuleGroups();
                    group.setName(name.trim());
                    group.setDescription(description);
                    group.setDisplayOrder(displayOrder);
                    group.setIsActive(isActive);

                    repository.save(group);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex) {

                    result.setFailedCount(result.getFailedCount() + 1);

                    String msg = ex.getMessage() == null ? "Unknown error" : ex.getMessage();
                    String[] err = msg.split("\\|");

                    result.getErrors().add(
                            new ImportErrorDetail(
                                    rowIndex + 1,
                                    err[0],
                                    err.length > 1 ? err[1] : msg
                            )
                    );
                }

                rowIndex++;
            }

        } catch (Exception e) {
            throw new RuntimeException("Import module groups failed");
        }

        return result;
    }



    @Override
    public ResponseEntity<byte[]> exportExcel() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("ModuleGroups");

            // ===== HEADER =====
            String[] headers = {
                    "moduleGroupName",
                    "moduleGroupDescription",
                    "moduleGroupOrder",
                    "moduleGroupActive",
                    "moduleTitle",
                    "moduleUrl",
                    "moduleIcon",
                    "moduleDescription",
                    "moduleOrder",
                    "moduleActive"
            };

            Row header = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }

            int rowIdx = 1;

            // ===== DATA =====
            for (ModuleGroups group : repository.findAllWithModules()) {

                // Không có module
                if (group.getModules() == null || group.getModules().isEmpty()) {
                    Row row = sheet.createRow(rowIdx++);
                    writeGroup(row, group);
                    continue;
                }

                // Có module
                for (var module : group.getModules()) {
                    Row row = sheet.createRow(rowIdx++);

                    // Module Group
                    writeGroup(row, group);

                    // Module
                    row.createCell(4).setCellValue(module.getTitle());
                    row.createCell(5).setCellValue(module.getUrl());
                    row.createCell(6).setCellValue(module.getIcon());
                    row.createCell(7).setCellValue(module.getDescription());
                    row.createCell(8).setCellValue(module.getDisplayOrder());
                    row.createCell(9).setCellValue(module.getIsActive());
                }
            }

            // Auto size
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=module-groups-with-modules.xlsx"
                    )
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Export failed", e);
        }
    }


    private String getString(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;

        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((int) cell.getNumericCellValue());
        }

        if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }

        return null;
    }

    private Integer getInteger(Row row, int index, Integer def) {
        Cell cell = row.getCell(index);
        if (cell == null) return def;

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            }

            if (cell.getCellType() == CellType.STRING) {
                String val = cell.getStringCellValue().trim();
                return val.isEmpty() ? def : Integer.parseInt(val);
            }
        } catch (Exception e) {
            return def;
        }

        return def;
    }
    private Boolean getBoolean(Row row, int index, Boolean def) {
        Cell cell = row.getCell(index);
        if (cell == null) return def;

        if (cell.getCellType() == CellType.BOOLEAN) {
            return cell.getBooleanCellValue();
        }

        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim().toLowerCase();
            if (val.equals("true") || val.equals("1") || val.equals("yes")) return true;
            if (val.equals("false") || val.equals("0") || val.equals("no")) return false;
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue() != 0;
        }

        return def;
    }

    private void writeGroup(Row row, ModuleGroups group) {
        row.createCell(0).setCellValue(group.getName());
        row.createCell(1).setCellValue(group.getDescription());
        row.createCell(2).setCellValue(group.getDisplayOrder());
        row.createCell(3).setCellValue(group.getIsActive());
    }

}
