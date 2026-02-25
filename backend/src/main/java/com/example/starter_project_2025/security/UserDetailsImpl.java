package com.example.starter_project_2025.security;

import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user_role.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails
{

    private UUID id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
    private Set<String> permissions;
    private boolean isActive;

    public static UserDetailsImpl build(User user)
    {
        // var permissions = user.getUserRoles().getPermissions();
        // if (permissions != null && !permissions.isEmpty()) {
        // System.out.println("First permission: " +
        // permissions.iterator().next().getName());
        // }

        var defaultRole = user.getUserRoles().stream()
                .filter(UserRole::isDefault)
                .findFirst()
                .orElse(null);

        String roleName = "";
        Set<String> permissions = new HashSet<>();

        if (defaultRole != null)
        {
            roleName = defaultRole.getRole().getName();
            permissions = defaultRole.getRole().getPermissions().stream()
                    .map(Permission::getName)
                    .collect(Collectors.toSet());
        }

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFirstName(),
                user.getLastName(),
                roleName,
                permissions,
                user.getIsActive()
        );
    }

    public static UserDetailsImpl build(User user, String RoleName, Set<String> permissions)
    {
        var userDetails = build(user);
        userDetails.setRole(RoleName);
        userDetails.setPermissions(permissions);
        return userDetails;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities()
    {
        System.out.println("[DEBUG] getAuthorities called for user: " + email);
        System.out.println("[DEBUG] permissions value: " + permissions);
        System.out.println("[DEBUG] permissions is null: " + (permissions == null));

        if (permissions == null)
        {
            System.out.println("[DEBUG] Returning empty set because permissions is null");
            return Set.of();
        }

        var authorities = permissions.stream()
                .map(permission -> new SimpleGrantedAuthority(permission))
                .collect(Collectors.toSet());
        System.out.println("[DEBUG] Returning authorities: " + authorities);
        return authorities;
    }

    @Override
    public String getUsername()
    {
        return email;
    }

    @Override
    public boolean isAccountNonExpired()
    {
        return true;
    }

    @Override
    public boolean isAccountNonLocked()
    {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired()
    {
        return true;
    }

    @Override
    public boolean isEnabled()
    {
        return isActive;
    }
}
