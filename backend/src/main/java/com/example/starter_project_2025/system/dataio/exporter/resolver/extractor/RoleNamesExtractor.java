package com.example.starter_project_2025.system.dataio.exporter.resolver.extractor;

import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class RoleNamesExtractor implements ExportValueExtractor {

    @Override
    public Object extract(Object source) {
        User user = (User) source;
        return user.getUserRoles()
                .stream()
                .map(r -> r.getRole().getName())
                .collect(Collectors.joining(", "));
    }
}
