package com.example.demo.services;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.example.demo.dtos.requestDto.LoginRequest;
import com.example.demo.dtos.responseDto.LoginResponse;
import com.example.demo.dtos.responseDto.UserResponse;


@Service
public class AuthService {

    private AuthenticationManager authenticationManager;
    private CustomUserDetailsService сustomUserDetailsService;
    private JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, 
                        CustomUserDetailsService customUserDetailsService, 
                        JwtService jwtService) {

        this.authenticationManager = authenticationManager;
        this.сustomUserDetailsService = customUserDetailsService;
        this.jwtService = jwtService;

    }


    //Сервис обработки /auth/login
    public ResponseEntity<?> login(LoginRequest loginRequest) {

        try {

            String login = loginRequest.getLogin();
            String password = loginRequest.getPassword();

            if (login == null || password == null) {

                throw new Exception();

            }

            // Аутентификация
            Authentication authentication = authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                    login,
                    password

                )

            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            //Получаем пользователя
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            //Получаем роль
            String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .findFirst()
                .orElse("USER");
            
            System.out.println(role);
            
            // Генерируем JWT 
            String accessToken = jwtService.generateAccessToken(userDetails.getUsername(), role);
            UserResponse userInfo = сustomUserDetailsService.getUserInfo(loginRequest.getLogin());
            
            System.out.println("Auth token created: " + accessToken);

            return ResponseEntity.ok(new LoginResponse(

                accessToken,
                jwtService.accessExpiration,
                userInfo
                
            ));
            
        } catch (AuthenticationException e) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("AUTH_INVALID_CREDENTIALS Неверный логин или пароль!");

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("VALIDATION_ERROR Логин или пароль невалиден!");

        }

    }
    
}