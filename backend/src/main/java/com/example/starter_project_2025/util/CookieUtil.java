package com.example.starter_project_2025.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil
{
    @Value("${app.jwt.rt.expiration-ms:604800000}")
    private long jwtRtExp;

    public void addCookie(HttpServletResponse response, String rt)
    {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", rt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(jwtRtExp)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearLogoutCookie(HttpServletResponse response)
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
