package com.example.starter_project_2025.system.auth.controller;

import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.auth.dto.register.RegisterVerifyDTO;
import com.example.starter_project_2025.system.auth.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
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

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Registers a new user and sends an OTP to their email.")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterCreateDTO registerCreateDTO) {
        String otp = authService.registerUser(registerCreateDTO);
        return new ResponseEntity<>(otp, HttpStatus.OK);
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyUser(
            @Valid @RequestBody RegisterVerifyDTO registerVerifyDTO) {
        boolean isVerified = authService.verifyEmail(registerVerifyDTO.getEmail(), registerVerifyDTO.getCode());
        return new ResponseEntity<>(isVerified, HttpStatus.OK);
    }

}
