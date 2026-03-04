package com.example.starter_project_2025.system.course_online.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.example.starter_project_2025.system.course_online.dto.MaterialOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.MaterialOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.MaterialUpdateOnlineRequest;

public interface MaterialOnlineService {
    MaterialOnlineResponse createMaterial(MaterialOnlineRequest request);
    MaterialOnlineResponse updateMaterial(UUID id, MaterialUpdateOnlineRequest request);
    void deleteMaterial(UUID id);
    MaterialOnlineResponse getMaterialById(UUID id);
    List<MaterialOnlineResponse> getMaterialsBySession(UUID sessionId);
    List<MaterialOnlineResponse> getActiveMaterialsBySession(UUID sessionId);
    MaterialOnlineResponse uploadMaterial(String title, String type, UUID sessionId, MultipartFile file,
                                     String description, String tags, Integer displayOrder, Boolean isActive);
}
