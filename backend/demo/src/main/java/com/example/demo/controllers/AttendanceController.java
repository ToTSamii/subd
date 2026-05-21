package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.requestDto.AttendanceRequest;
import com.example.demo.services.AttendanceService;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/attendance")
@Slf4j
public class AttendanceController {

    private AttendanceService attendanceService; 

    public AttendanceController(AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
        
    }


    @PostMapping("/")
    public ResponseEntity<?> addAttedance(@RequestBody AttendanceRequest attendanceRequest) {

        return attendanceService.addAttedance(attendanceRequest);

    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(@RequestBody AttendanceRequest attendanceRequest, @PathVariable Integer id) {

        return attendanceService.updateAttendance(id, attendanceRequest);

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Integer id) {

        return attendanceService.deleteAttendance(id);

    }
    
}
