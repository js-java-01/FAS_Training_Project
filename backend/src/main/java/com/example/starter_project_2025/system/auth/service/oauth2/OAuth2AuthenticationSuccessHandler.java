package com.example.starter_project_2025.system.auth.service.oauth2;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.service.refreshToken.RefreshTokenService;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.util.CookieUtil;
import com.example.starter_project_2025.security.JwtUtil;
import jakarta.persistence.EntityManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler
{
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final CookieUtil cookieUtil;
    private final EntityManager entityManager;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException
    {
        var oAuth2user = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2user.getAttribute("email");

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(ErrorMessage.USER_NOT_FOUND));
        entityManager.refresh(user);

        String rt = refreshTokenService.generateAndSaveRefreshToken(user);
        String at = jwtUtil.generateToken(UserDetailsImpl.build(user));

        cookieUtil.addCookie(response, rt);
        String targetUrl = frontendUrl + "/oauth2/redirect?token=" + at;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
