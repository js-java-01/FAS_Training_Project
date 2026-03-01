package com.example.starter_project_2025.system.course.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.starter_project_2025.system.course.dto.MaterialRequest;
import com.example.starter_project_2025.system.course.dto.MaterialResponse;
import com.example.starter_project_2025.system.course.dto.MaterialUpdateRequest;
import com.example.starter_project_2025.system.course.service.MaterialService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@Tag(name = "Material Management", description = "APIs for managing course materials (videos, documents, links, etc.)")
@SecurityRequirement(name = "Bearer Authentication")
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    @Operation(summary = "Create a new material", description = "Attach a material (video, document, link, etc.) to a session")
    public ResponseEntity<MaterialResponse> createMaterial(@Valid @RequestBody MaterialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materialService.createMaterial(request));
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload material file", description = "Upload a file and attach it to a session")
    public ResponseEntity<MaterialResponse> uploadMaterial(
            @RequestParam String title,
            @RequestParam String type,
            @RequestParam UUID sessionId,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) Integer displayOrder,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                materialService.uploadMaterial(title, type, sessionId, file, description, tags, displayOrder, isActive)
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update material", description = "Update material details and metadata")
    public ResponseEntity<MaterialResponse> updateMaterial(
            @PathVariable UUID id,
            @Valid @RequestBody MaterialUpdateRequest request) {
        return ResponseEntity.ok(materialService.updateMaterial(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete material", description = "Remove a material from a session")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get material details", description = "Retrieve a specific material by ID")
    public ResponseEntity<MaterialResponse> getMaterialById(@PathVariable UUID id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get materials for a session", description = "Retrieve all materials (active and inactive) for a specific session")
    public ResponseEntity<List<MaterialResponse>> getMaterialsBySession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(materialService.getMaterialsBySession(sessionId));
    }

    @GetMapping("/session/{sessionId}/active")
    @Operation(summary = "Get active materials for a session", description = "Retrieve only active materials for a specific session (for student view)")
    public ResponseEntity<List<MaterialResponse>> getActiveMaterialsBySession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(materialService.getActiveMaterialsBySession(sessionId));
    }
}
