package com.example.starter_project_2025.system.modulegroups.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.modulegroups.service.ModuleImportExportService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@Tag(name = "Module Import/Export")
@SecurityRequirement(name = "bearerAuth")
public class ModuleImportExportController {

    private final ModuleImportExportService service;

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        return service.downloadTemplate();
    }

    @PostMapping(
            value = "/import",
            consumes = "multipart/form-data"
    )
    @PreAuthorize("hasAuthority('MODULE_CREATE')")
    public ResponseEntity<ImportResultResponse> importModules(
            @RequestPart("file") MultipartFile file
    ) {

        ImportResultResponse response = service.importExcel(file);

        if (response.getFailedCount() > 0) {
            response.setMessage("Import modules done. Some records failed to import.");
            return ResponseEntity.badRequest().body(response);
        }

        response.setMessage("Import modules successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportModules() {
        return service.exportExcel();
    }
}
