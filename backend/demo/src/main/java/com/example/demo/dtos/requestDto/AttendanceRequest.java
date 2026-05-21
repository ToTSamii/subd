package com.example.demo.dtos.requestDto;

import java.util.Date;

import lombok.Data;


@Data
public class AttendanceRequest {

    private Integer studentId;
    private Integer courseId;
    private Integer grade;
    private Date date;
    
}
