package com.example.starter_project_2025.system.auth.controller;

import com.example.starter_project_2025.base.controller.BaseCrudDataIoController;
import com.example.starter_project_2025.base.repository.BaseRepository;
import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionCreateRequest;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionFilter;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionResponse;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionUpdateRequest;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.service.permission.PermissionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/permissions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Permission Management", description = "APIs for managing permissions")
public class PermissionController extends BaseCrudDataIoController<
        Permission,
        UUID,
        PermissionResponse,
        PermissionCreateRequest,
        PermissionUpdateRequest,
        PermissionFilter> {

    PermissionService permissionService;
    PermissionRepository permissionRepository;

    @Override
    protected CrudService<UUID, PermissionResponse, PermissionCreateRequest, PermissionUpdateRequest, PermissionFilter> getService() {
        return permissionService;
    }

    @Override
    protected BaseRepository<Permission, UUID> getRepository() {
        return permissionRepository;
    }

    @Override
    protected Class<Permission> getEntityClass() {
        return Permission.class;
    }
}
