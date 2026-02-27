package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportErrorDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
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

@Service
@RequiredArgsConstructor
public class ModuleImportExportServiceImpl implements ModuleImportExportService {

    private final ModuleRepository moduleRepository;
    private final ModuleGroupsRepository moduleGroupsRepository;

    private static final String[] TEMPLATE_HEADERS = {
            "title",
            "url",
            "icon",
            "description",
            "moduleGroup",
            "displayOrder",
            "isActive",
            "requiredPermission"
    };

    // ================= TEMPLATE =================

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Modules");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=modules-template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate module template", e);
        }
    }

    // ================= IMPORT =================

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

            if (sheet.getPhysicalNumberOfRows() == 0) {
                throw new RuntimeException("File is empty");
            }

            Iterator<Row> rows = sheet.iterator();

            // ===== HEADER CHECK =====
            Row header = rows.next();
            validateHeader(header);

            int rowIndex = 1;

            while (rows.hasNext()) {

                Row row = rows.next();
                rowIndex++;

                if (isRowEmpty(row)) {
                    continue;
                }

                result.setTotalRows(result.getTotalRows() + 1);

                try {

                    String title = getString(row, 0);
                    String url = getString(row, 1);
                    String icon = getString(row, 2);
                    String description = getString(row, 3);
                    String moduleGroupName = getString(row, 4);
                    Integer displayOrder = getInteger(row, 5, 0);
                    Boolean isActive = getBoolean(row, 6, true);
                    String requiredPermission = getString(row, 7);

                    // ===== VALIDATION =====

                    if (title == null || title.isBlank()) {
                        throw new IllegalArgumentException("title|Title is required");
                    }

                    if (!title.matches("^[A-Za-z\\s]+$")) {
                        throw new IllegalArgumentException("title|Only letters and spaces are allowed");
                    }

                    if (moduleRepository.existsByTitleIgnoreCase(title.trim())) {
                        throw new IllegalArgumentException("title|Title already exists");
                    }

                    if (url == null || url.isBlank()) {
                        throw new IllegalArgumentException("url|URL is required");
                    }

                    if (url.contains(" ")) {
                        throw new IllegalArgumentException("url|URL must not contain spaces");
                    }

                    if (moduleRepository.existsByUrlIgnoreCase(url.trim())) {
                        throw new IllegalArgumentException("url|URL already exists");
                    }

                    if (moduleGroupName == null || moduleGroupName.isBlank()) {
                        throw new IllegalArgumentException("moduleGroup|Module group is required");
                    }

                    List<ModuleGroups> groups =
                            moduleGroupsRepository.findAllByNameAndIsActiveTrue(moduleGroupName.trim());

                    if (groups.isEmpty()) {
                        throw new IllegalArgumentException("moduleGroup|Module group not found");
                    }

                    if (groups.size() > 1) {
                        throw new IllegalArgumentException(
                                "moduleGroup|Duplicate module group name: " + moduleGroupName
                        );
                    }

                    ModuleGroups group = groups.getFirst();
                    // ===== SAVE =====

                    Module module = new Module();
                    module.setTitle(title.trim());
                    module.setUrl(url.trim());
                    module.setIcon(icon);
                    module.setDescription(description);
                    module.setModuleGroup(groups.get(0));
                    module.setDisplayOrder(displayOrder);
                    module.setIsActive(isActive);
                    module.setRequiredPermission(requiredPermission);

                    moduleRepository.save(module);

                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex) {

                    result.setFailedCount(result.getFailedCount() + 1);

                    String msg = ex.getMessage() == null ? "Unknown error" : ex.getMessage();
                    String[] err = msg.split("\\|");

                    result.getErrors().add(
                            new ImportErrorDetail(
                                    rowIndex,
                                    err[0],
                                    err.length > 1 ? err[1] : msg
                            )
                    );
                }
            }

            if (result.getTotalRows() == 0) {
                throw new RuntimeException("File contains no data rows");
            }

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Import modules failed", e);
        }

        return result;
    }

    // ================= HEADER VALIDATION =================

    private void validateHeader(Row header) {

        if (header.getLastCellNum() != TEMPLATE_HEADERS.length) {
            throw new RuntimeException("Invalid template format");
        }

        for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {

            Cell cell = header.getCell(i);

            if (cell == null ||
                    !cell.getStringCellValue().trim()
                            .equalsIgnoreCase(TEMPLATE_HEADERS[i])) {

                throw new RuntimeException(
                        "Invalid template header. Expected: "
                                + TEMPLATE_HEADERS[i]
                                + " at column " + (i + 1)
                );
            }
        }
    }

    // ================= EXPORT =================

    @Override
    public ResponseEntity<byte[]> exportExcel() {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Modules");

            Row header = sheet.createRow(0);
            for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
                header.createCell(i).setCellValue(TEMPLATE_HEADERS[i]);
            }

            int rowIdx = 1;

            for (Module m : moduleRepository.findAll()) {

                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(m.getTitle());
                row.createCell(1).setCellValue(m.getUrl());
                row.createCell(2).setCellValue(m.getIcon());
                row.createCell(3).setCellValue(m.getDescription());
                row.createCell(4).setCellValue(m.getModuleGroup().getName());
                row.createCell(5).setCellValue(m.getDisplayOrder());
                row.createCell(6).setCellValue(m.getIsActive());
                row.createCell(7).setCellValue(m.getRequiredPermission());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=modules.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Module export failed", e);
        }
    }

    // ================= HELPERS =================

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
        } catch (Exception ignored) {}

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

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;

        for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                if (cell.getCellType() == CellType.STRING &&
                        !cell.getStringCellValue().trim().isEmpty()) {
                    return false;
                }
                if (cell.getCellType() != CellType.STRING) {
                    return false;
                }
            }
        }
        return true;
    }
}