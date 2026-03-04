package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.modulegroups.dto.response.ImportResultResponse;
import com.example.starter_project_2025.system.topic.service.TopicImportExportService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicImportExportController
{

    private final TopicImportExportService service;

    @GetMapping("/template")
    @Operation(summary = "Download Excel template for importing topics")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public ResponseEntity<byte[]> downloadTemplate()
    {
        return service.downloadTemplate();
    }

    @PostMapping(
            value = "/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Import topics from Excel file")
    @PreAuthorize("hasAuthority('TOPIC_CREATE')")
    public ResponseEntity<ImportResultResponse> importTopics(
            @RequestPart("file") MultipartFile file
    )
    {
        ImportResultResponse response = service.importExcel(file);

        if (response.getFailedCount() > 0)
        {
            response.setMessage("Import topics done. Some records failed to import.");
            return ResponseEntity.badRequest().body(response);
        }

        response.setMessage("Import topics successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export")
    @Operation(summary = "Export all topics to Excel file")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public ResponseEntity<byte[]> exportTopics()
    {
        return service.exportExcel();
    }
}