package com.example.starter_project_2025.security;

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
        var permissions = user.getRole().getPermissions();
        if (permissions != null && !permissions.isEmpty())
        {
            System.out.println("First permission: " + permissions.iterator().next().getName());
        }

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().getName(),
                permissions.stream().map(p -> p.getName()).collect(Collectors.toSet()),
                user.getIsActive()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities()
    {
        return permissions.stream()
                .map(permission -> new SimpleGrantedAuthority(permission))
                .collect(Collectors.toSet());
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
