package com.example.demo.dtos.responseDto;

import lombok.Data;

@Data
public class ResponseCourse {

    private String name;
    private String description;
    private Integer durationHours;
    private Double cost;
    
}
