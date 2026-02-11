package com.example.starter_project_2025.system.department.controller;

import com.example.starter_project_2025.system.department.dto.DepartmentImportResult;
import com.example.starter_project_2025.system.department.entity.Department;
import com.example.starter_project_2025.system.department.dto.DepartmentDTO;
import com.example.starter_project_2025.system.department.service.DepartmentImportExportService;
import com.example.starter_project_2025.system.department.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Department")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentController {
    private final DepartmentService departmentService;
    private final DepartmentImportExportService importExportService;

    @GetMapping
    public List<DepartmentDTO> getAll() {
        return departmentService.getAll();
    }

    @PostMapping("/create")
    public ResponseEntity<Department> create(@RequestBody DepartmentDTO dto) {
        return ResponseEntity.ok(departmentService.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        departmentService.delete(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get department by ID",
            description = "Retrieve department details by UUID")
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(departmentService.getById(id));
    }

    @Operation(summary = "Update department",
            description = "Update department information by UUID")
    @PutMapping("/{id}")
    public ResponseEntity<Department> update(@PathVariable UUID id, @RequestBody DepartmentDTO dto) {
        return ResponseEntity.ok(departmentService.update(id, dto));
    }

    // ==================== Import/Export ====================

    @Operation(summary = "Export departments",
            description = "Export department list to CSV or XLSX format")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @Parameter(description = "Export format: csv or xlsx", example = "xlsx")
            @RequestParam(defaultValue = "xlsx") String format) {

        byte[] data = importExportService.exportDepartments(format);

        String fileName = "departments." + format;

        MediaType mediaType = format.equalsIgnoreCase("csv")
                ? MediaType.TEXT_PLAIN
                : MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + fileName)
                .contentType(mediaType)
                .body(data);
    }

    @Operation(summary = "Import departments",
            description = "Upload Excel file (.xlsx) to import departments")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DepartmentImportResult importDepartments(
            @RequestPart("file") MultipartFile file) {

        return importExportService.importDepartments(new MultipartFile[]{file});
    }


    @Operation(summary = "Download import template",
            description = "Download Excel template file for department import")
    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadTemplate() {

        byte[] file = importExportService.downloadImportTemplate();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=department_import_template.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }
}