package com.example.demo.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.services.AuthServices.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class JwtFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService;


    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws IOException, ServletException {

        String uri = request.getRequestURI();

        if (uri.equals("/api/auth/login") || uri.equals("/api/auth/register")) {

            chain.doFilter(request, response);
            return;

        }

        String authHeader = request.getHeader("Authorization");
            
        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            if (jwtService.validateToken(token) && !jwtService.isTokenExpired(token)) {

                String login = jwtService.parseLogin(token);
                String role = jwtService.parseRole(token);

                // Создаем authorities из роли
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

                System.out.println("Authorities: " + authorities);
                    
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(login, null, authorities);
                    
                SecurityContextHolder.getContext().setAuthentication(auth);   

            } else {

                sendError(response, "UNAUTHORIZED", "Невалидный токен!");
                return;
                
            }

        } else {

            sendError(response, "UNAUTHORIZED", "Отсутствует заголовок Authorization");
            return;

        }

        chain.doFilter(request, response);

    }


    // Если JWT невалидный, отправляем ошибку
    private void sendError(HttpServletResponse response, String error, String message) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        String json = String.format("{\"error\":\"%s\",\"message\":\"%s\"}", error, message);
        response.getOutputStream().write(json.getBytes(StandardCharsets.UTF_8));

    }

}
