package com.example.starter_project_2025.system.dataio.mapping.role;

import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.dataio.core.importer.resolver.LookupResolver;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class PermissionLookupResolver implements LookupResolver {

    @Override
    public Object resolve(String value, ApplicationContext ctx) {

        if (value == null || value.isBlank()) {
            return new HashSet<>();
        }

        PermissionRepository permissionRepo = ctx.getBean(PermissionRepository.class);

        String[] permissionNames = value.split(",");

        Set<Permission> permissions = new HashSet<>();

        for (String name : permissionNames) {
            Permission permission = permissionRepo.findByName(name.trim())
                    .orElseThrow(() ->
                            new RuntimeException("Permission not found: " + name.trim())
                    );

            permissions.add(permission);
        }

        return permissions;
    }
}
