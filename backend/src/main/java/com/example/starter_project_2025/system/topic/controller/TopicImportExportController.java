package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.service.TopicImportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Tag(name = "Topics Import/Export", description = "APIs for importing and exporting topics via Excel")
@SecurityRequirement(name = "bearerAuth")
public class TopicImportExportController
{

    private final TopicImportExportService topicService;

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('TOPIC_EXPORT')")
    @Operation(summary = "Export topics to Excel")
    public ResponseEntity<InputStreamResource> exportTopics() throws IOException
    {
        ByteArrayInputStream in = topicService.exportTopics();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=topics_export.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/template")
    @Operation(summary = "Download topic import template")
    public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException
    {
        ByteArrayInputStream in = topicService.downloadTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=topic_import_template.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('TOPIC_IMPORT')")
    @Operation(summary = "Import topics from Excel")
    public ResponseEntity<Void> importTopics(@RequestParam("file") MultipartFile file) throws IOException
    {
        topicService.importTopics(file);
        return ResponseEntity.ok().build();
    }
}
