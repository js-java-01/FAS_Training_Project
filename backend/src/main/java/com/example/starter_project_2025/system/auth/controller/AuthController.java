package com.example.starter_project_2025.system.auth.controller;

import com.example.starter_project_2025.system.auth.dto.forgotpassword.ForgotPasswordCreateDTO;
import com.example.starter_project_2025.system.auth.dto.forgotpassword.ForgotPasswordDTO;
import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.auth.dto.register.RegisterVerifyDTO;
import com.example.starter_project_2025.system.auth.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import com.example.starter_project_2025.constant.SuccessMessage;
import com.example.starter_project_2025.system.auth.dto.login.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import com.example.starter_project_2025.system.auth.service.auth.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest reqLogin, HttpServletResponse response) {
        var res = authService.login(reqLogin, response);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Registers a new user and sends an OTP to their email.")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterCreateDTO registerCreateDTO) {
        String success = authService.registerUser(registerCreateDTO);
        return new ResponseEntity<>(success, HttpStatus.OK);
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyUser(
            @Valid @RequestBody RegisterVerifyDTO registerVerifyDTO) {
        boolean isVerified = authService.verifyEmail(registerVerifyDTO.getEmail(), registerVerifyDTO.getCode());
        return new ResponseEntity<>(isVerified, HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordCreateDTO forgotPasswordCreateDTO) {
        String success = authService.forgotPassword(forgotPasswordCreateDTO.getEmail());
        return new ResponseEntity<>(success, HttpStatus.OK);
    }

    @PostMapping("/verify-forgot-password")
    public ResponseEntity<Boolean> verifyForgotPasswordOtpAndSavePassword(
            @Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO) {
        boolean isVerified = authService.verifyForgotPasswordOtpAndSavePassword(forgotPasswordDTO);
        return new ResponseEntity<>(isVerified, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.ok(SuccessMessage.LOGOUT_SUCCESS);
    }
}
