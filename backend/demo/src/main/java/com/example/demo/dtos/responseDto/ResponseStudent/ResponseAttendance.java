package com.example.demo.dtos.responseDto.ResponseStudent;

import java.util.Date;

import lombok.Data;


@Data
public class ResponseAttendance {

    private Integer grade;
    private Date date;
    private String courseName;
    
}
