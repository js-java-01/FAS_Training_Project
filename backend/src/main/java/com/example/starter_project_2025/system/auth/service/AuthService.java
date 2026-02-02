package com.example.starter_project_2025.system.auth.service;

import com.example.starter_project_2025.system.auth.dto.login.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import com.example.starter_project_2025.security.JwtUtil;
import com.example.starter_project_2025.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        String token = jwtUtil.generateToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        var permissions = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        System.out.println("=== AUTH SERVICE DEBUG ===");
        System.out.println("User: " + userDetails.getEmail());
        System.out.println("Role: " + userDetails.getRole());
        System.out.println("Authorities count: " + userDetails.getAuthorities().size());
        System.out.println("Permissions: " + permissions);
        System.out.println("Permissions count: " + permissions.size());

        return new LoginResponse(
                token,
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                userDetails.getRole(),
                permissions
        );
    }
}
