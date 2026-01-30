package com.example.starter_project_2025.system.auth.dto.login;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class LoginResponse
{
    private String token;
    private String type = "Bearer";
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Set<String> permissions;

    public LoginResponse(String token, String email, String firstName, String lastName, String role, Set<String> permissions)
    {
        this.token = token;
        this.type = "Bearer";
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.permissions = permissions;
    }
}
