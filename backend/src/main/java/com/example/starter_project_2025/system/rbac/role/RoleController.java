package com.example.starter_project_2025.system.rbac.role;

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
@RequestMapping("/api/roles")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Role Management", description = "APIs for managing roles")
public class RoleController
        extends BaseCrudDataIoController<Role, UUID, RoleDTO, RoleFilter> {

    RoleService roleService;
    RoleRepository roleRepository;

    @Override
    protected CrudService<UUID, RoleDTO, RoleFilter> getService() {
        return roleService;
    }

    @Override
    protected BaseCrudRepository<Role, UUID> getRepository() {
        return roleRepository;
    }

    @Override
    protected Class<Role> getEntityClass() {
        return Role.class;
    }
}
