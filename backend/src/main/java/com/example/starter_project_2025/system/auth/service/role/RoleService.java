package com.example.starter_project_2025.system.auth.service.role;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.auth.dto.role.RoleCreateRequest;
import com.example.starter_project_2025.system.auth.dto.role.RoleFilter;
import com.example.starter_project_2025.system.auth.dto.role.RoleResponse;
import com.example.starter_project_2025.system.auth.dto.role.RoleUpdateRequest;

import java.util.UUID;

public interface RoleService extends CrudService<
        UUID,
        RoleResponse,
        RoleCreateRequest,
        RoleUpdateRequest,
        RoleFilter
        > {
}
