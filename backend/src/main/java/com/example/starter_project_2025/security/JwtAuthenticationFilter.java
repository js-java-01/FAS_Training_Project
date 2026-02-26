package com.example.starter_project_2025.security;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@ComponentScan
public class JwtAuthenticationFilter extends OncePerRequestFilter
{

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException
    {
        try
        {
            String jwt = getJwtFromRequest(request);
            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt))
            {
//                String userId = jwtUtil.getUserIdFromToken(jwt);
//                if (redisService.isBlacklisted(userId)) {
//                    response.sendError(HttpServletResponse.SC_FORBIDDEN, ErrorMessage.ACCOUNT_HAS_BEEN_LOCKED);
//                    return;
//                }

                UserDetails userDetails = jwtUtil.getUserDetailsFromToken(jwt);

                if (userDetails != null && !userDetails.isEnabled())
                {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, ErrorMessage.ACCOUNT_HAS_BEEN_LOCKED);
                    return;
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex)
        {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request)
    {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer "))
        {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
    {
        String path = request.getServletPath();
        return path.equals("/api/auth/refresh");
    }

}
