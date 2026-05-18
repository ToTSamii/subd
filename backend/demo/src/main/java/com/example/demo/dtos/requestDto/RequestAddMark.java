package com.example.demo.dtos.requestDto;

import lombok.Data;

@Data
public class RequestAddMark {

    private Integer studentId;
    private Integer courseId;
    private Integer grade;
    
}
