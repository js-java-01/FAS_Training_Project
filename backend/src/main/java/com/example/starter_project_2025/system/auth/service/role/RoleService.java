package com.example.starter_project_2025.system.auth.service.role;

import com.example.starter_project_2025.system.auth.dto.role.RoleCreateRequest;
import com.example.starter_project_2025.system.auth.dto.role.RoleResponse;
import com.example.starter_project_2025.system.auth.dto.role.RoleUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RoleService {

    Page<RoleResponse> getAll(
            Pageable pageable,
            String search,
            Boolean isActive,
            List<UUID> permissionIds,
            LocalDateTime createFrom,
            LocalDateTime createTo
    );

    RoleResponse getById(UUID id);

    RoleResponse create(RoleCreateRequest request);

    RoleResponse update(UUID id, RoleUpdateRequest request);

    void delete(UUID id);
}
