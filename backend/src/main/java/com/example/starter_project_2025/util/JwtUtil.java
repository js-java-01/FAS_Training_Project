package com.example.starter_project_2025.util;

import com.example.starter_project_2025.security.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtUtil
{

    @Value("${JWT_SECRET}")
    private String jwtSecret;

//    @Value("${app.jwt.at.expiration-ms:900000}")
//    private long jwtExps;

    private long jwtAtExp = 10;
    @Value("${app.jwt.rt.expiration-ms:604800000}")
    private long jwtRtExp;

    private Key getSigningKey()
    {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication)
    {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return buildToken(userDetails, jwtAtExp);
    }

    public String generateToken(UserDetailsImpl userDetails)
    {
        return buildToken(userDetails, jwtAtExp);
    }

    public String generateRtToken(UserDetailsImpl userDetails)
    {
        return buildToken(userDetails, jwtRtExp);
    }

    private String buildToken(UserDetailsImpl userDetails, long exp)
    {
        var now = new Date();
        var expDate = new Date(now.getTime() + exp);

        return Jwts.builder()
                .setSubject(userDetails.getEmail())
                .claim("userId", userDetails.getId().toString())
                .claim("role", userDetails.getRole())
                .claim("permission", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList())
                )
                .setIssuedAt(now)
                .setExpiration(expDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromToken(String token)
    {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token)
    {
        try
        {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e)
        {
            return false;
        }
    }

    private Claims getClaimsFromToken(String token)
    {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public UserDetails getUserDetailsFromToken(String token)
    {
        Claims claims = getClaimsFromToken(token);
        UUID id = UUID.fromString(claims.get("userId", String.class));
        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        List<String> permissionList = (List<String>) claims.get("permissions");
        Set<String> permissions = permissionList.stream()
                .collect(Collectors.toSet());
        return new UserDetailsImpl(id, email, null, null, null, role, permissions, true);
    }

}
