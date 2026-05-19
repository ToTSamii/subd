package com.example.demo.dtos.requestDto;

import java.util.Date;

import lombok.Data;

@Data
public class RequestSchedule {

    private String topic;
    private Date dateTime;
    private Integer groupId;
    
}
