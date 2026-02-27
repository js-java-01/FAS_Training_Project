package com.example.starter_project_2025.system.semester.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.semester.services.SemesterImportExportServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
@Tag(name = "Semester Import/Export", description = "APIs for importing and exporting semesters via Excel")
@SecurityRequirement(name = "bearerAuth")
public class SemesterImportExportController
{
    private final SemesterImportExportServiceImpl service;

    @GetMapping("/template")
    @Operation(summary = "Download Excel template for importing semesters")
    @PreAuthorize("hasAuthority('SEMESTER_READ')")
    public ResponseEntity<byte[]> downloadTemplate()
    {
        return service.downloadTemplate();
    }

    @PostMapping(
            value = "/import",
            consumes = "multipart/form-data"
    )
    @Operation(summary = "Import semesters from Excel file")
    @PreAuthorize("hasAuthority('SEMESTER_CREATE')")
    public ResponseEntity<ImportResultResponse> importSemesters(
            @RequestPart("file") MultipartFile file
    )
    {
        ImportResultResponse response = service.importExcel(file);

        if (response.getFailedCount() > 0)
        {
            response.setMessage("Import semesters done. Some records failed to import.");
            return ResponseEntity.badRequest().body(response);
        }

        response.setMessage("Import semesters successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export")
    @Operation(summary = "Export all semesters to Excel file")
    @PreAuthorize("hasAuthority('SEMESTER_READ')")
    public ResponseEntity<byte[]> exportSemesters()
    {
        return service.exportExcel();
    }
}
