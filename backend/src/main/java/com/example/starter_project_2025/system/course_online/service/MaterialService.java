package com.example.starter_project_2025.system.course_online.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.example.starter_project_2025.system.course_online.dto.MaterialRequest;
import com.example.starter_project_2025.system.course_online.dto.MaterialResponse;
import com.example.starter_project_2025.system.course_online.dto.MaterialUpdateRequest;

public interface MaterialService {
    MaterialResponse createMaterial(MaterialRequest request);
    MaterialResponse updateMaterial(UUID id, MaterialUpdateRequest request);
    void deleteMaterial(UUID id);
    MaterialResponse getMaterialById(UUID id);
    List<MaterialResponse> getMaterialsBySession(UUID sessionId);
    List<MaterialResponse> getActiveMaterialsBySession(UUID sessionId);
    MaterialResponse uploadMaterial(String title, String type, UUID sessionId, MultipartFile file,
                                     String description, String tags, Integer displayOrder, Boolean isActive);
}
