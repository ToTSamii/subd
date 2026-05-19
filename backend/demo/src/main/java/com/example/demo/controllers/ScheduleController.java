package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dtos.requestDto.RequestSchedule;
import com.example.demo.services.ScheduleService;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/schedule")
@Slf4j
public class ScheduleController {

    private ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {

        this.scheduleService = scheduleService;

    }


    @PostMapping("/")
    public ResponseEntity<?> addSchedule(@RequestBody RequestSchedule requestSchedule) {
        
        return scheduleService.addSchedule(requestSchedule);

    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Integer id, @RequestBody RequestSchedule requestSchedule) {

        return scheduleService.updateSchedule(id, requestSchedule);

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Integer id) {

        return scheduleService.deleteSchedule(id);

    }
    
}
