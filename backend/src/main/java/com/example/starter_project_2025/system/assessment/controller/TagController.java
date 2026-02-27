package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.questionTag.request.CreateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.request.UpdateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagResponse;
import com.example.starter_project_2025.system.assessment.service.questionTag.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;

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
}
