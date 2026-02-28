package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.questionTag.request.CreateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.request.UpdateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagCountResponse;
import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagResponse;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import com.example.starter_project_2025.system.assessment.repository.TagRepository;
import com.example.starter_project_2025.system.assessment.service.questionTag.TagService;
import com.example.starter_project_2025.system.assessment.service.questionTag.impl.TagServiceImpl;
import com.example.starter_project_2025.system.dataio.core.common.FileFormat;
import com.example.starter_project_2025.system.dataio.core.exporter.service.ExportService;
import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.core.importer.service.ImportService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;
    private final ImportService importService;
    private final ExportService exportService;
    private final TagRepository tagRepository;

    @PostMapping
    public ResponseEntity<TagResponse> create(
            @Valid @RequestBody CreateTagRequest request
    ) {
        return ResponseEntity.ok(tagService.create(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TagResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateTagRequest request
    ) {
        return ResponseEntity.ok(tagService.update(id, request));
    }

    @GetMapping
    public ResponseEntity<Page<TagResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(tagService.getAll(pageable));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public void exportTags(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response
    ) throws IOException {

        exportService.export(
                format,
                tagRepository.findAll(),
                Tag.class,
                response
        );
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ImportResult importTags(
            @RequestParam("file") MultipartFile file
    ) {

        return importService.importFile(
                file,
                Tag.class,
                tagRepository
        );
    }

}
