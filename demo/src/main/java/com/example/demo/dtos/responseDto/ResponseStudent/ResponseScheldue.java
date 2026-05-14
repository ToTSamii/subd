package com.example.demo.dtos.responseDto.ResponseStudent;

import java.util.Date;

import lombok.Data;

@Data
public class ResponseScheldue {

    private Date dateTime;
    private String topic;
    private String groupName;
    private String teacherFio;
    
}
