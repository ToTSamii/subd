package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;


public class Security {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    // Получаем SecretKey один раз для производительности
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)                           // вместо setSubject
                .issuedAt(new Date())                        // вместо setIssuedAt
                .expiration(new Date(System.currentTimeMillis() + 3600000)) // вместо setExpiration
                .signWith(getSigningKey(), Jwts.SIG.HS256)   // новый способ подписи
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())             // вместо setSigningKey
                    .build()
                    .parseSignedClaims(token)                // вместо parseClaimsJws
                    .getPayload();                           // вместо getBody
        } catch (Exception e) {
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }
    
    // Дополнительный полезный метод
    public String extractUsername(String token) {
        return validateToken(token).getSubject();
    }
    
    public boolean isTokenExpired(String token) {
        return validateToken(token).getExpiration().before(new Date());
    }
    
    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}