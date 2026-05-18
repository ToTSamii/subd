package com.example.demo.dtos.responseDto;

import java.util.Date;

import lombok.Data;


@Data
public class ResponseGroup {

    private String name;
    private Date startDate;
    private Date endDate;
    private String courseName; 
    
}
