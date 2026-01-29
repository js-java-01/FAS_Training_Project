package com.example.starter_project_2025.system.auth.controller;

import com.example.starter_project_2025.system.auth.dto.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.LoginResponse;
import com.example.starter_project_2025.system.auth.service.auth.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

}
