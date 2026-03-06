package com.example.starter_project_2025.system.rbac.role;

import com.example.starter_project_2025.base.crud.CrudService;
import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.dto.role.RoleSummaryDTO;

import java.util.List;
import java.util.UUID;

public interface RoleService extends CrudService<UUID, RoleDTO, RoleFilter> {

    List<RoleSummaryDTO> getMyRoles(UserDetailsImpl userDetails);
}
