package com.example.starter_project_2025.system.auth.service.auth;

import com.example.starter_project_2025.system.auth.dto.login.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService
{

    LoginResponse login(LoginRequest reqData, HttpServletResponse response);

    void logout(HttpServletRequest request, HttpServletResponse response);
}
