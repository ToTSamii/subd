package com.example.demo.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dtos.requestDto.LoginRequest;
import com.example.demo.dtos.requestDto.RequestRegister;
import com.example.demo.services.AuthServices.AuthService;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    
    private AuthService authService;

    public AuthController(AuthService authService) {

        this.authService = authService;
        
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        return authService.login(loginRequest);

    }
    

    @PostMapping("/register")
    public ResponseEntity<?> registerPost(@RequestBody RequestRegister requestRegister) {

        return authService.register(requestRegister);

    }


    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String token) {

        return authService.me(token);

    }

}
