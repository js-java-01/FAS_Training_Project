package com.example.starter_project_2025.system.auth.service.auth;

import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;

public interface AuthService {
    public String registerUser(RegisterCreateDTO registerCreateDTO);

    public boolean verifyEmail(String email, String code);
}
