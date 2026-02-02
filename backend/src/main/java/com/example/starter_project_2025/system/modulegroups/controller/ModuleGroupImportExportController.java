package com.example.starter_project_2025.system.modulegroups.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.modulegroups.service.ModuleGroupImportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/module-groups")
@RequiredArgsConstructor
@Tag(name = "Module Group Import/Export")
@SecurityRequirement(name = "bearerAuth")

public class ModuleGroupImportExportController {

    private final ModuleGroupImportExportService service;

    @GetMapping("/template")
    @Operation(summary = "Download module group import template")
    public ResponseEntity<byte[]> downloadTemplate() {
        return service.downloadTemplate();
    }

    @PostMapping(
            value = "/import",
            consumes = "multipart/form-data"
    )
    @Operation(summary = "Import module groups from Excel")
    public ResponseEntity<ImportResultResponse> importModuleGroups(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.importExcel(file));
    }

    @GetMapping("/export")
    @Operation(summary = "Export module groups to Excel")
    public ResponseEntity<byte[]> exportModuleGroups() {
        return service.exportExcel();
    }
}
