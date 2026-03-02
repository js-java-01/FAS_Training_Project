package com.example.starter_project_2025.system.auth.service.role;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.auth.dto.role.RoleDTO;
import com.example.starter_project_2025.system.auth.dto.role.RoleFilter;

import java.util.UUID;

public interface RoleService extends CrudService<UUID, RoleDTO, RoleFilter> {
}
