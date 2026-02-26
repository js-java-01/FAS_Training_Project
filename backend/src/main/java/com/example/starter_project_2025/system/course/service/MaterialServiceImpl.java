package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.course.dto.MaterialRequest;
import com.example.starter_project_2025.system.course.dto.MaterialResponse;
import com.example.starter_project_2025.system.course.dto.MaterialUpdateRequest;
import com.example.starter_project_2025.system.course.entity.Material;
import com.example.starter_project_2025.system.course.entity.Session;
import com.example.starter_project_2025.system.course.enums.MaterialType;
import com.example.starter_project_2025.system.course.mapper.MaterialMapper;
import com.example.starter_project_2025.system.course.repository.MaterialRepository;
import com.example.starter_project_2025.system.course.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final SessionRepository sessionRepository;
    private final MaterialMapper materialMapper;

    @Value("${material.upload.dir:uploads/materials}")
    private String uploadDir;

    @Override
    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN') or hasRole('TRAINER')")
    public MaterialResponse createMaterial(MaterialRequest request) {
        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", request.getSessionId()));

        Material material = materialMapper.toEntity(request);
        material.setSession(session);

        return materialMapper.toResponse(materialRepository.save(material));
    }

    @Override
    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN') or hasRole('TRAINER')")
    public MaterialResponse updateMaterial(UUID id, MaterialUpdateRequest request) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", id));

        if (request.getTitle() != null) material.setTitle(request.getTitle());
        if (request.getDescription() != null) material.setDescription(request.getDescription());
        if (request.getType() != null) material.setType(MaterialType.valueOf(request.getType().toUpperCase()));
        if (request.getSourceUrl() != null) material.setSourceUrl(request.getSourceUrl());
        if (request.getTags() != null) material.setTags(request.getTags());
        if (request.getDisplayOrder() != null) material.setDisplayOrder(request.getDisplayOrder());
        if (request.getIsActive() != null) material.setIsActive(request.getIsActive());

        return materialMapper.toResponse(materialRepository.save(material));
    }

    @Override
    @PreAuthorize("hasAuthority('SESSION_DELETE') or hasRole('ADMIN') or hasRole('TRAINER')")
    public void deleteMaterial(UUID id) {
        if (!materialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Material", "id", id);
        }
        materialRepository.deleteById(id);
    }

    @Override
    public MaterialResponse getMaterialById(UUID id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", id));
        return materialMapper.toResponse(material);
    }

    @Override
    public List<MaterialResponse> getMaterialsBySession(UUID sessionId) {
        return materialRepository.findBySessionIdOrderByDisplayOrderAsc(sessionId)
                .stream()
                .map(materialMapper::toResponse)
                .toList();
    }

    @Override
    public List<MaterialResponse> getActiveMaterialsBySession(UUID sessionId) {
        return materialRepository.findBySessionIdAndIsActiveTrueOrderByDisplayOrderAsc(sessionId)
                .stream()
                .map(materialMapper::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN') or hasRole('TRAINER')")
    public MaterialResponse uploadMaterial(String title, String type, UUID sessionId, MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            // Verify session exists
            Session session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // Save file
            Files.write(filePath, file.getBytes());

            // Create material entity
            Material material = Material.builder()
                    .title(title)
                    .type(MaterialType.valueOf(type.toUpperCase()))
                    .sourceUrl("/api/files/materials/" + fileName)
                    .session(session)
                    .displayOrder(0)
                    .isActive(true)
                    .build();

            Material saved = materialRepository.save(material);
            log.info("Material uploaded successfully: {} for session: {}", fileName, sessionId);

            return materialMapper.toResponse(saved);
        } catch (IOException e) {
            log.error("Failed to upload material file", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }
}
