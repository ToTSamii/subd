package com.example.demo.dtos.responseDto;

import java.util.List;

import com.example.demo.entities.Attendance;

import lombok.Data;

@Data
public class ResponseAttendanceList {

    private List<Attendance> attendances;
    
}
