package com.example.starter_project_2025.system.dataio.mapping.user;

import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.dataio.core.importer.resolver.LookupResolver;
import com.example.starter_project_2025.system.user_role.entity.UserRole;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class RoleLookupResolver implements LookupResolver {

    @Override
    public Object resolve(String value, ApplicationContext ctx) {

        RoleRepository roleRepo = ctx.getBean(RoleRepository.class);

        String[] roleNames = value.split(",");

        Set<UserRole> userRoles = new HashSet<>();

        for (String roleName : roleNames) {

            Role role = roleRepo.findByName(roleName.trim())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

            UserRole ur = new UserRole();
            ur.setRole(role);

            userRoles.add(ur);
        }

        return userRoles;
    }
}
