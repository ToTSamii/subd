package com.example.demo.dtos.responseDto.ResponseTeacher;

import java.util.Date;

import lombok.Data;

@Data
public class ResponseScheldueTeacher {

    private Date dateTime;
    private String topic;
    private String groupName;
    
}
