package com.example.starter_project_2025.security;

import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private UUID id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
    private Set<Permission> permissions;
    private boolean isActive;

    public static UserDetailsImpl build(User user) {
        var permissions = user.getRole().getPermissions();
        System.out.println("=== UserDetailsImpl.build DEBUG ===");
        System.out.println("User: " + user.getEmail());
        System.out.println("Role: " + user.getRole().getName());
        System.out.println("Role object: " + user.getRole());
        System.out.println("Permissions object: " + permissions);
        System.out.println("Permissions count: " + (permissions != null ? permissions.size() : "null"));
        if (permissions != null && !permissions.isEmpty()) {
            System.out.println("First permission: " + permissions.iterator().next().getName());
        }

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().getName(),
                permissions,
                user.getIsActive()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> authorities = permissions.stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                .collect(Collectors.toSet());
        return permissions.stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
