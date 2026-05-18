package com.example.demo.dtos.requestDto;

import java.util.Date;
import lombok.Data;

@Data
public class RequestUser {

    private String login;
    private String password;
    private String email;
    private Date registrationDate;
    private String photo;
    private String role;
    
}
