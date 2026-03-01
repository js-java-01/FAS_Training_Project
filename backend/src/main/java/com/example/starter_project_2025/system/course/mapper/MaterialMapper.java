package com.example.starter_project_2025.system.course.mapper;

import com.example.starter_project_2025.system.course.dto.MaterialRequest;
import com.example.starter_project_2025.system.course.dto.MaterialResponse;
import com.example.starter_project_2025.system.course.entity.Material;
import com.example.starter_project_2025.system.course.enums.MaterialType;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {
    public Material toEntity(MaterialRequest request) {
        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setType(MaterialType.valueOf(request.getType().toUpperCase()));
        material.setSourceUrl(request.getSourceUrl());
        material.setTags(request.getTags());
        material.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        material.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return material;
    }

    public MaterialResponse toResponse(Material entity) {
        MaterialResponse response = new MaterialResponse();
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
