package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.course_online.dto.MaterialOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.MaterialOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.MaterialUpdateOnlineRequest;
import com.example.starter_project_2025.system.course_online.entity.MaterialOnline;
import com.example.starter_project_2025.system.course_online.entity.SessionOnline;
import com.example.starter_project_2025.system.course_online.enums.MaterialTypeOnline;
import com.example.starter_project_2025.system.course_online.mapper.MaterialOnlineMapper;
import com.example.starter_project_2025.system.course_online.repository.MaterialOnlineRepository;
import com.example.starter_project_2025.system.course_online.repository.SessionOnlineRepository;

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
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MaterialOnlineServiceImpl implements MaterialOnlineService {

    private final MaterialOnlineRepository materialRepository;
    private final SessionOnlineRepository sessionRepository;
    private final MaterialOnlineMapper materialMapper;

    @Value("${material.upload.dir:uploads/materials}")
    private String uploadDir;

    @Override
    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN') or hasRole('TRAINER')")
    public MaterialOnlineResponse createMaterial(MaterialOnlineRequest request) {
        SessionOnline session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("SessionOnline", "id", request.getSessionId()));

        MaterialOnline material = materialMapper.toEntity(request);
        material.setSession(session);

        return materialMapper.toResponse(materialRepository.save(material));
    }

    @Override
    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN') or hasRole('TRAINER')")
    public MaterialOnlineResponse updateMaterial(UUID id, MaterialUpdateOnlineRequest request) {
        MaterialOnline material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaterialOnline", "id", id));

        if (request.getTitle() != null) material.setTitle(request.getTitle());
        if (request.getDescription() != null) material.setDescription(request.getDescription());
        if (request.getType() != null) material.setType(MaterialTypeOnline.valueOf(request.getType().toUpperCase()));
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
            throw new ResourceNotFoundException("MaterialOnline", "id", id);
        }
        materialRepository.deleteById(id);
    }

    @Override
    public MaterialOnlineResponse getMaterialById(UUID id) {
        MaterialOnline material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaterialOnline", "id", id));
        return materialMapper.toResponse(material);
    }

    @Override
    public List<MaterialOnlineResponse> getMaterialsBySession(UUID sessionId) {
        return materialRepository.findBySessionIdOrderByDisplayOrderAsc(sessionId)
                .stream()
                .map(materialMapper::toResponse)
                .toList();
    }

    @Override
    public List<MaterialOnlineResponse> getActiveMaterialsBySession(UUID sessionId) {
        return materialRepository.findBySessionIdAndIsActiveTrueOrderByDisplayOrderAsc(sessionId)
                .stream()
                .map(materialMapper::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('SESSION_UPDATE') or hasRole('ADMIN') or hasRole('TRAINER')")
    public MaterialOnlineResponse uploadMaterial(String title, String type, UUID sessionId, MultipartFile file,
                                           String description, String tags, Integer displayOrder, Boolean isActive) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            SessionOnline session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("SessionOnline", "id", sessionId));

            // Resolve to an absolute path so we don't accidentally land inside
            // the Tomcat temp working directory when the path is relative.
            Path uploadPath = Paths.get(uploadDir).isAbsolute()
                    ? Paths.get(uploadDir)
                    : Paths.get(System.getProperty("user.dir")).resolve(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            // Use Files.copy(InputStream) instead of transferTo() – transferTo() with a
            // relative Path resolves against Tomcat's temp working directory.
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            MaterialOnline material = MaterialOnline.builder()
                    .title(title)
                    .type(MaterialTypeOnline.valueOf(type.toUpperCase()))
                    .sourceUrl("/api/files/materials/" + fileName)
                    .session(session)
                    .description(description)
                    .tags(tags)
                    .displayOrder(displayOrder != null ? displayOrder : 0)
                    .isActive(isActive != null ? isActive : true)
                    .build();

            MaterialOnline saved = materialRepository.save(material);
            log.info("MaterialOnline uploaded successfully: {} for session: {}", fileName, sessionId);

            return materialMapper.toResponse(saved);
        } catch (IOException e) {
            log.error("Failed to upload material file", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }
}
