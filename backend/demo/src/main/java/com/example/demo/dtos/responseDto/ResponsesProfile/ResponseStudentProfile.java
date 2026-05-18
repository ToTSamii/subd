package com.example.demo.dtos.responseDto.ResponsesProfile;

import java.util.Date;

import lombok.Data;

@Data
public class ResponseStudentProfile {

    private String firstName;
    private String lastName;
    private String middleName;
    private Date birthDate;
    private String login;
    private String email;
    private String photo;
    private String courseName;
    private String groupName;
    private String roleName;
    
}
