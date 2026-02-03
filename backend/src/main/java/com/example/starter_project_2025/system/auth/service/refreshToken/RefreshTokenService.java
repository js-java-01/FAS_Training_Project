package com.example.starter_project_2025.system.auth.service.refreshToken;

import com.example.starter_project_2025.system.user.entity.User;

import java.util.UUID;

public interface RefreshTokenService
{
    String generateAndSaveRefreshToken(User user);

    void revokeAllByUser(UUID userId);
}
