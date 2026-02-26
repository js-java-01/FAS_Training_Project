package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.MaterialRequest;
import com.example.starter_project_2025.system.course.dto.MaterialResponse;
import com.example.starter_project_2025.system.course.dto.MaterialUpdateRequest;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

public interface MaterialService {
    MaterialResponse createMaterial(MaterialRequest request);
    MaterialResponse updateMaterial(UUID id, MaterialUpdateRequest request);
    void deleteMaterial(UUID id);
    MaterialResponse getMaterialById(UUID id);
    List<MaterialResponse> getMaterialsBySession(UUID sessionId);
    List<MaterialResponse> getActiveMaterialsBySession(UUID sessionId);
    MaterialResponse uploadMaterial(String title, String type, UUID sessionId, MultipartFile file);
}
