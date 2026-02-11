package com.example.starter_project_2025.util;

import com.example.starter_project_2025.security.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.at.expiration}")
    private long jwtExpiration;

    @Value("${jwt.rt.expiration}")
    private long refreshTokenExpiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return generateToken(userDetails);
    }

    public String generateToken(UserDetailsImpl userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        var permissions = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        System.out.println("token: " + userDetails.getEmail());
        System.out.println("Permissions in token: " + permissions);

        return Jwts.builder()
                .setSubject(userDetails.getEmail())
                .claim("userId", userDetails.getId().toString())
                .claim("role", userDetails.getRole())
                .claim("permissions", permissions)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRtToken(UserDetailsImpl userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .setSubject(userDetails.getEmail())
                .claim("userId", userDetails.getId().toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public UserDetailsImpl getUserDetailsFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        System.out.println("[DEBUG JWT] Parsing token for user: " + claims.getSubject());
        System.out.println("[DEBUG JWT] All claims: " + claims);
        System.out.println("[DEBUG JWT] Permissions claim: " + claims.get("permissions"));

        // Extract permissions from token claims
        @SuppressWarnings("unchecked")
        java.util.List<String> permissionsList = (java.util.List<String>) claims.get("permissions");
        java.util.Set<String> permissions = permissionsList != null
            ? new java.util.HashSet<>(permissionsList)
            : new java.util.HashSet<>();

        System.out.println("[DEBUG JWT] Extracted permissions set: " + permissions);

        return new UserDetailsImpl(
                java.util.UUID.fromString(claims.get("userId").toString()),
                claims.getSubject(),
                null, // password not stored in token
                null, // firstName not stored in token
                null, // lastName not stored in token
                claims.get("role").toString(),
                permissions, // NOW we actually pass the permissions!
                true  // assume active if token is valid
        );
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
