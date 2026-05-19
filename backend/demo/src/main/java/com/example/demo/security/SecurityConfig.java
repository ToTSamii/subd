package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.demo.services.AuthServices.CustomUserDetailsService;


@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {

        this.userDetailsService = userDetailsService;

    }
    

    @Bean
    public JwtFilter authenticationJwtTokenFilter() {

        return new JwtFilter();

    }
    

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;

    }
    

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {

        return authConfig.getAuthenticationManager();

    }
    

    @Bean
    public PasswordEncoder passwordEncoder() {

       return NoOpPasswordEncoder.getInstance();

    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**", "/api/group/all").hasRole("Администратор")
                .requestMatchers("/api/teacher/**", "/api/schedule/**", "/api/group/**").hasAnyRole("Преподаватель", "Администратор")
                .requestMatchers("/api/profile/", "/api/student/**", "/api/auth/me").hasAnyRole("Студент", "Преподаватель", "Администратор")
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/courses/**").permitAll()
                .anyRequest().authenticated()
            )
        .exceptionHandling(ex -> ex
                .accessDeniedHandler((request, response, accessDeniedException) -> {

                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\":\"AUTH_FORBIDDEN\", \"message\":\"Недостаточно прав для доступа к ресурсу\"}");

                })
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\":\"UNAUTHORIZED\", \"message\":\"Требуется аутентификация\"}");
                })
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();

    }

}