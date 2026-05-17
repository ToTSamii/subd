package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.requestDto.RequestAddMark;
import com.example.demo.services.StudentService;
import com.example.demo.services.TeacherService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/teacher")
@Slf4j
public class TeacherController {

    private TeacherService teacherService;
    private StudentService studentService;

    public TeacherController(TeacherService teacherService, StudentService studentService) {

        this.teacherService = teacherService;
        this.studentService = studentService;

    }


    @GetMapping("/groups/{id}")
    public ResponseEntity<?> getTeacherGroups(@PathVariable Integer id) {

        return teacherService.getTeacherGroups(id);

    }


    @GetMapping("/schedule/{id}")
    public ResponseEntity<?> getTeacherSchedule(@PathVariable Integer id) {

        return teacherService.getTeacherSchedule(id);

    }


    @PostMapping("/addMark")
    public ResponseEntity<?> addMark(@RequestBody RequestAddMark requestAddMark) {
    
        return studentService.addStudentMark(requestAddMark);

    }
    
}
