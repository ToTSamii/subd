package com.example.demo.dtos.responseDto;

import lombok.Data;

@Data
public class LoginResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserResponse user;

    public LoginResponse(String accessToken, long expiresIn, UserResponse user) {

        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.user = user;
        
    }

}
