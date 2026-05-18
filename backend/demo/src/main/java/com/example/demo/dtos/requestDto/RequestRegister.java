package com.example.demo.dtos.requestDto;

import java.util.Date;

import lombok.Data;


@Data
public class RequestRegister {

    private String login;
    private String password;
    private String email;
    private String photo;
    private String firstName;
    private String lastName;
    private String middleName;
    private Date birthDate;

    
}
