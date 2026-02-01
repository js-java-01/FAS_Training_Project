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

    @Override
    public ImportResultResponse importExcel(MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (!rows.hasNext()) {
                return result;
            }

            rows.next(); // skip header
            int rowIndex = 1;

            while (rows.hasNext()) {
                Row row = rows.next();
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
                    if (url == null || url.isBlank()) {
                        throw new IllegalArgumentException("url|URL is required");
                    }
                    if (moduleGroupName == null || moduleGroupName.isBlank()) {
                        throw new IllegalArgumentException("moduleGroup|Module group is required");
                    }

                    ModuleGroups group = moduleGroupsRepository
                            .findByName(moduleGroupName)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "moduleGroup|Module group not found: " + moduleGroupName
                                    ));

                    if (moduleRepository.existsByModuleGroupIdAndTitle(group.getId(), title)) {
                        throw new IllegalArgumentException(
                                "title|Module title already exists in this module group"
                        );
                    }

                    Module module = new Module();
                    module.setTitle(title);
                    module.setUrl(url);
                    module.setIcon(icon);
                    module.setDescription(description);
                    module.setModuleGroup(group);
                    module.setDisplayOrder(displayOrder);
                    module.setIsActive(isActive);
                    module.setRequiredPermission(requiredPermission);

                    moduleRepository.save(module);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex) {
                    result.setFailedCount(result.getFailedCount() + 1);

                    String[] err = ex.getMessage().split("\\|");
                    result.getErrors().add(
                            new ImportErrorDetail(
                                    rowIndex + 1,
                                    err[0],
                                    err.length > 1 ? err[1] : ex.getMessage()
                            )
                    );
                }

                rowIndex++;
            }

        } catch (Exception e) {
            throw new RuntimeException("Module import failed", e);
        }

        return result;
    }

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

    private String getString(Row row, int index) {
        Cell cell = row.getCell(index);
        return cell == null ? null : cell.getStringCellValue().trim();
    }

    private Integer getInteger(Row row, int index, Integer def) {
        Cell cell = row.getCell(index);
        return cell == null ? def : (int) cell.getNumericCellValue();
    }

    private Boolean getBoolean(Row row, int index, Boolean def) {
        Cell cell = row.getCell(index);
        return cell == null ? def : cell.getBooleanCellValue();
    }
}
