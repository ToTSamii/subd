package com.example.demo.dtos.requestDto;

import java.util.Date;
import lombok.Data;

@Data
public class RequestGroup {

    private String name;
    private Date startDate;
    private Date endDate;
    private Integer courseCode;
    private Integer teacherCode;
    
}