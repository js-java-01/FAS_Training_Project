package com.example.starter_project_2025.system.auth.service.refreshToken;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.entity.RefreshToken;
import com.example.starter_project_2025.system.auth.repository.RefreshTokenRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService
{
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Override
    public String generateAndSaveRefreshToken(User user)
    {
        refreshTokenRepository.revokeAllByUser(user);
        refreshTokenRepository.flush();

        var userDetails = UserDetailsImpl.build(user);
        String token = jwtUtil.generateRtToken(userDetails);

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
