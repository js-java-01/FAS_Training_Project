package com.example.starter_project_2025.system.auth.mapper;

import com.example.starter_project_2025.base.mapper.BaseMapper;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionCreateRequest;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionResponse;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionUpdateRequest;
import com.example.starter_project_2025.system.auth.entity.Permission;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PermissionMapper extends BaseMapper<
        Permission,
        PermissionResponse,
        PermissionCreateRequest,
        PermissionUpdateRequest> {
}
