package com.example.starter_project_2025.system.course_online.mapper;

import org.springframework.stereotype.Component;

import com.example.starter_project_2025.system.course_online.dto.MaterialOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.MaterialOnlineResponse;
import com.example.starter_project_2025.system.course_online.entity.MaterialOnline;
import com.example.starter_project_2025.system.course_online.enums.MaterialTypeOnline;

@Component
public class MaterialOnlineMapper {
    public MaterialOnline toEntity(MaterialOnlineRequest request) {
        MaterialOnline material = new MaterialOnline();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setType(MaterialTypeOnline.valueOf(request.getType().toUpperCase()));
        material.setSourceUrl(request.getSourceUrl());
        material.setTags(request.getTags());
        material.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        material.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return material;
    }

    public MaterialOnlineResponse toResponse(MaterialOnline entity) {
        MaterialOnlineResponse response = new MaterialOnlineResponse();
        response.setId(entity.getId());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setType(entity.getType().name());
        response.setSourceUrl(entity.getSourceUrl());
        response.setTags(entity.getTags());
        response.setSessionId(entity.getSession().getId());
        response.setDisplayOrder(entity.getDisplayOrder());
        response.setIsActive(entity.getIsActive());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}
