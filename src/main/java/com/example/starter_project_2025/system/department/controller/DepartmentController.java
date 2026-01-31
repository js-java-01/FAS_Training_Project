package com.example.starter_project_2025.system.department.controller;

import com.example.starter_project_2025.system.department.dto.CreateDepartmentRequest;
import com.example.starter_project_2025.system.department.entity.Department;
import com.example.starter_project_2025.system.department.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Department Management", description = "APIs for handling department records and operations")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Autowired
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    @Operation(
            summary = "Create a new department",
            description = "Submit department details including name, code, and location ID to create a new record."
    )
    public ResponseEntity<Department> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        Department createdDepartment = departmentService.createDepartment(request);
        return new ResponseEntity<>(createdDepartment, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a department")
    public ResponseEntity<Void> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/import-template")
    public ResponseEntity<byte[]> downloadImportTemplate() throws IOException {
        byte[] templateData = departmentService.generateImportTemplate();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=department_import_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(templateData);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    @GetMapping("/export") //
    // @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')") // Bật nếu cần check quyền
    public ResponseEntity<byte[]> exportDepartments() throws IOException {
        byte[] data = departmentService.exportDepartments();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=departments_export.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}