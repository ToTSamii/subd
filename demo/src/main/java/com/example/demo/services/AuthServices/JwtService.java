package com.example.demo.services.AuthServices;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;


@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access.expirationMs}")
    public long accessExpiration;


    //Генерация ключа
    private Key getKey() {

        return Keys.hmacShaKeyFor(jwtSecret.getBytes());

    }


    //Генерация access-токена
    public String generateAccessToken(String login, String role) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        claims.put("role", role);

        return generateToken(login, claims, accessExpiration);

    }


    //Генерация токена
    public String generateToken(String login, Map<String, Object> claims, long expiration) {

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(login)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getKey(), SignatureAlgorithm.HS256)
            .compact();

    }


    // Получение всех claims из токена
    public Claims parseToken(String token) {

        return Jwts.parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody();

    }


    //Получение логина из токена
    public String parseLogin(String token) {

        return Jwts.parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();

    }


    // Получение роли из токена
    public String parseRole(String token) {

        return (String) parseToken(token).get("role");

    }


    //Проверка токена на правильность
    public boolean validateToken(String token) {

        try {

            Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token);

            return true;

        } catch (Exception e) {

            return false;

        }

    }


    // Проверка, не истек ли токен
    public boolean isTokenExpired(String token) {

        return parseToken(token).getExpiration().before(new Date());

    }


    //Получение времени жизни токена
    public Date extractExpiration(String token) {

        return Jwts.parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getExpiration();

    }
    
}