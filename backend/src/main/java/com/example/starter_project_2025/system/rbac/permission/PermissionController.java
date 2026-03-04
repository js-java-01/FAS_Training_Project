package com.example.starter_project_2025.system.rbac.permission;

import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
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
public class PermissionController
        extends BaseCrudDataIoController<Permission, UUID, PermissionDTO, PermissionFilter> {

    PermissionService permissionService;
    PermissionRepository permissionRepository;

    @Override
    protected CrudService<UUID, PermissionDTO, PermissionFilter> getService() {
        return permissionService;
    }

    @Override
    protected BaseCrudRepository<Permission, UUID> getRepository() {
        return permissionRepository;
    }

    @Override
    protected Class<Permission> getEntityClass() {
        return Permission.class;
    }
}
