package com.example.starter_project_2025.system.auth.service.refreshToken;

import com.example.starter_project_2025.system.auth.entity.RefreshToken;
import com.example.starter_project_2025.system.auth.repository.RefreshTokenRepository;
import com.example.starter_project_2025.system.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService
{
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Override
    public String generateAndSaveRefreshToken(User user)
    {
        refreshTokenRepository.revokeAllByUser(user);
        refreshTokenRepository.flush();

        String token = UUID.randomUUID().toString();

        var newRtToken = new RefreshToken();
        newRtToken.setUser(user);
        newRtToken.setToken(token);
        newRtToken.setRevoked(false);
        Instant expDate = Instant.now().plus(7, ChronoUnit.DAYS);
        newRtToken.setExpiryDate((expDate));

        refreshTokenRepository.save(newRtToken);

        return token;
    }

    @Override
    public void revokeAllByUser(UUID userId)
    {
        refreshTokenRepository.revokeAllByUserId(userId);
        refreshTokenRepository.flush();
    }
}
