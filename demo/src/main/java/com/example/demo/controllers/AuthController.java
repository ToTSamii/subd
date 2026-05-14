package com.example.demo.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dtos.requestDto.LoginRequest;
import com.example.demo.services.AuthService;
import lombok.extern.slf4j.Slf4j;


@RestController
@Slf4j
public class AuthController {
    
    private AuthService authService;

    public AuthController(AuthService authService) {

        this.authService = authService;
        
    }


    @PostMapping("api/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        return authService.login(loginRequest);

    }
    

    @PostMapping("api/auth/register")
    public void registerPost() {
        System.out.println("sf");
    }

}
