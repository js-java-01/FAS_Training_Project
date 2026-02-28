package com.example.starter_project_2025.system.dataio.mapping.role;

import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PermissionNamesExtractor implements ExportValueExtractor {

    @Override
    public Object extract(Object source) {

        Role role = (Role) source;

        if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
            return "";
        }

        return role.getPermissions()
                .stream()
                .map(p -> p.getName())
                .sorted()
                .collect(Collectors.joining(", "));
    }
}
