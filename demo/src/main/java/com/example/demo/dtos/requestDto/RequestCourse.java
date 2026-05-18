package com.example.demo.dtos.requestDto;

import lombok.Data;

@Data
public class RequestCourse {
    
    private String name;
    private String description;
    private Integer durationHours;
    private Double cost;

}
