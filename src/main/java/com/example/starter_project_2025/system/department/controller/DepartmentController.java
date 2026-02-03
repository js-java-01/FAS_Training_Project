package com.example.starter_project_2025.system.department.controller;

import com.example.starter_project_2025.system.department.entity.Department;
import com.example.starter_project_2025.system.department.dto.DepartmentDTO;
import com.example.starter_project_2025.system.department.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Department Management", description = "APIs for handling department records and operations")
public class DepartmentController {

    private final DepartmentService departmentService;

    //Vy
    @GetMapping
    @Operation(summary = "Get all departments")
    public List<DepartmentDTO> getAll() {
        return departmentService.getAll();
    }

    //Vy
    @PostMapping("/create")
    @Operation(summary = "Create a new department")
    public ResponseEntity<Department> create(@RequestBody DepartmentDTO dto) {
        return ResponseEntity.ok(departmentService.create(dto));
    }

    //   ---thư---//
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a department")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/import-template")
    @Operation(summary = "Download import template")
    public ResponseEntity<byte[]> downloadImportTemplate() throws IOException {
        byte[] templateData = departmentService.generateImportTemplate();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=department_import_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(templateData);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import departments from Excel")
    public ResponseEntity<String> importDepartments(@RequestParam("file") MultipartFile file) {
        try {
            departmentService.importDepartments(file);
            return ResponseEntity.ok("Import successful");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error processing file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Validation Error: " + e.getMessage());
        }
    }

    @GetMapping("/export")
    @Operation(summary = "Export departments to Excel")
    public ResponseEntity<byte[]> exportDepartments() throws IOException {
        byte[] data = departmentService.exportDepartments();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=departments_export.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
