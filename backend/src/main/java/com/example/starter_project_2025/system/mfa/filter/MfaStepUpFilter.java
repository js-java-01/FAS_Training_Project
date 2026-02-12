package com.example.starter_project_2025.system.mfa.filter;

import com.example.starter_project_2025.system.mfa.service.MfaSessionService;
import com.example.starter_project_2025.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MfaStepUpFilter extends OncePerRequestFilter {

    private final MfaSessionService mfaSessionService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip MFA check for certain paths
        String path = request.getRequestURI();
        if (shouldSkipMfaCheck(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Skip if not authenticated
        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Only check for ADMIN role
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_ADMIN") || auth.equals("ADMIN"));

        if (!isAdmin) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if this is a sensitive operation
        if (isSensitiveOperation(authentication)) {
            // Extract JWT token
            String token = extractToken(request);
            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // Extract jti from token
            String jti = jwtUtil.extractJti(token);

            // Check if step-up is valid
            if (!mfaSessionService.isStepUpValid(jti)) {
                sendMfaRequiredResponse(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipMfaCheck(String path) {
        return path.startsWith("/mfa/") ||
               path.startsWith("/auth/") ||
               path.startsWith("/oauth2/") ||
               path.startsWith("/login") ||
               path.startsWith("/register");
    }

    private boolean isSensitiveOperation(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth ->
                        auth.endsWith("_CREATE") ||
                        auth.endsWith("_UPDATE") ||
                        auth.endsWith("_DELETE") ||
                        auth.endsWith("_ASSIGN") ||
                        auth.endsWith("_ACTIVATE")
                );
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private void sendMfaRequiredResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("code", "MFA_REQUIRED");
        errorResponse.put("message", "Step-up authentication required");

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
