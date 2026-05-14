package com.example.demo.dtos.responseDto.ResponsesProfile;

import java.util.Date;

import lombok.Data;

@Data
public class ResponseTeacherProfile {

    private String firstName;
    private String lastName;
    private String middleName;
    private String qualification;
    private Date hireDate;
    private String email;
    private String login;
    private String photo;
    private String phoneNumber;
    private String roleName;
    
}
