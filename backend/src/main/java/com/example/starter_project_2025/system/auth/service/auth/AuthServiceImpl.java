package com.example.starter_project_2025.system.auth.service.auth;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.dto.login.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import com.example.starter_project_2025.system.auth.service.refreshToken.RefreshTokenService;
import com.example.starter_project_2025.system.user.service.UserService;
import com.example.starter_project_2025.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService
{
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtils;
    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private UserService userServiceImpl;

    @Override
    public LoginResponse login(LoginRequest reqData, HttpServletResponse response)
    {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(reqData.getEmail(), reqData.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String at = jwtUtils.generateToken(authentication);

        if (reqData.isRememberedMe())
        {
            var user = userServiceImpl.findByEmail(userDetails.getEmail());
            var rt = refreshTokenService.generateAndSaveRefreshToken(user);
            ResponseCookie cookie = ResponseCookie.from("refresh_token", rt)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        return new LoginResponse(at, userDetails.getEmail(), userDetails.getFirstName(), userDetails.getLastName(), userDetails.getRole(), userDetails.getPermissions());
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response)
    {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails)
        {
            refreshTokenService.revokeAllByUser(userDetails.getId());

            clearLogoutCookie(response);

            SecurityContextHolder.clearContext();
        } else if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String)
        {
            clearLogoutCookie(response);
        }
    }

    private void clearLogoutCookie(HttpServletResponse response)
    {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
