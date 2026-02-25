package com.example.starter_project_2025.system.auth.service.refreshToken;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.entity.RefreshToken;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RefreshTokenRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService
{
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Override
    public String generateAndSaveRefreshToken(User user, Optional<Role> role)
    {
        refreshTokenRepository.revokeAllByUser(user);
        refreshTokenRepository.flush();

        var userDetails = UserDetailsImpl.build(user);
        if (role.isPresent())
        {
            var permissions = role.get().getPermissions().stream().map(p -> p.getName()).collect(Collectors.toSet());
            userDetails = UserDetailsImpl.build(user, role.get().getName(), permissions);
        }
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
