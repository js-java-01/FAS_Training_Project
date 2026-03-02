package com.example.starter_project_2025.system.auth.service.permission;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionDTO;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionFilter;

import java.util.UUID;

public interface PermissionService extends CrudService<UUID, PermissionDTO, PermissionFilter> {
}
