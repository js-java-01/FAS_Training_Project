package com.example.starter_project_2025.system.auth.service.auth;

import com.example.starter_project_2025.system.auth.dto.forgotpassword.ForgotPasswordDTO;
import com.example.starter_project_2025.system.auth.dto.login.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService
{
    public String registerUser(RegisterCreateDTO registerCreateDTO);

    public boolean verifyEmail(String email, String code);

    public String forgotPassword(String email);

    public boolean verifyForgotPasswordOtpAndSavePassword(ForgotPasswordDTO forgotPasswordDTO);

    LoginResponse login(LoginRequest reqData, HttpServletResponse response);

    void logout(HttpServletRequest request, HttpServletResponse response);

    LoginResponse refresh(String token);
}
