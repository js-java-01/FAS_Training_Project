package com.example.starter_project_2025.system.mfa.filter;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.mfa.service.MfaService;
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
    private final MfaService mfaService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        
        if (shouldSkipMfaCheck(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        Object principal = authentication.getPrincipal();
        
        // Check if user is ADMIN by role field
        boolean isAdmin = false;
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            String role = userDetails.getRole();
            isAdmin = "ADMIN".equalsIgnoreCase(role);
        }

        if (!isAdmin) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if user has MFA enabled
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean mfaEnabled = mfaService.isMfaEnabled(userDetails.getId());

            if (!mfaEnabled) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Check if this is a sensitive operation based on HTTP method
        boolean isSensitive = isSensitiveOperation(method);
        
        if (isSensitive) {
            String token = extractToken(request);
            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            String jti = jwtUtil.extractJti(token);
            boolean isValid = mfaSessionService.isStepUpValid(jti);
            
            if (!isValid) {
                sendMfaRequiredResponse(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipMfaCheck(String path) {
        return path.startsWith("/api/mfa/") ||
               path.startsWith("/mfa/") ||
               path.startsWith("/api/auth/") ||
               path.startsWith("/auth/") ||
               path.startsWith("/oauth2/") ||
               path.startsWith("/login") ||
               path.startsWith("/register");
    }

    private boolean isSensitiveOperation(String method) {
        // Only require MFA step-up for write operations
        return "POST".equalsIgnoreCase(method) ||
               "PUT".equalsIgnoreCase(method) ||
               "DELETE".equalsIgnoreCase(method) ||
               "PATCH".equalsIgnoreCase(method);
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
