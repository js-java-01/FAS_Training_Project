package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.ExportPreviewResponse;
import com.example.starter_project_2025.system.assessment.dto.ExportRequest;
import com.example.starter_project_2025.system.assessment.service.AssessmentExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/assessment-type/export")
@RequiredArgsConstructor
public class AssessmentExportController {

    private final AssessmentExportService exportService;

    @PostMapping("/preview")
    public ExportPreviewResponse getPreview(@RequestBody ExportRequest request) {
        return exportService.getPreview(request);
    }

    @PostMapping
    public ResponseEntity<Resource> export(@Valid @RequestBody ExportRequest request) {
        Resource resource = exportService.export(request);

        String date = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String extension = exportService.getFileExtension(request);
        String filename = String.format("assessment-types-%s.%s", date, extension);
        String contentType = exportService.getContentType(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
