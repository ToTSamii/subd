package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.services.TeacherService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/teacher")
@Slf4j
public class TeacherController {

    private TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {

        this.teacherService = teacherService;

    }


    @GetMapping("/groups/{id}")
    public ResponseEntity<?> getTeacherGroups(@PathVariable Integer id) {

        return teacherService.getTeacherGroups(id);

    }


    @GetMapping("/schedule/{id}")
    public ResponseEntity<?> getTeacherSchedule(@PathVariable Integer id) {

        return teacherService.getTeacherSchedule(id);

    }
    
}
