package com.example.starter_project_2025.system.auth.service.refreshToken;

import com.example.starter_project_2025.system.auth.entity.RefreshToken;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.user.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenService
{
    String generateAndSaveRefreshToken(User user, Optional<Role> role);

    void revokeAllByUser(UUID userId);

    RefreshToken verifyRefreshToken(String token);
}
