package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.services.StudentService;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/student")
@Slf4j
public class StudentController {

    StudentService studentService;

    StudentController(StudentService studentService) {

        this.studentService = studentService;

    }


    @GetMapping("/schedule/{id}")
    public ResponseEntity<?> getSchedule(@PathVariable Integer id) {

        return studentService.getStudentSchedule(id);

    }


    @GetMapping("/attendance/{id}")
    public ResponseEntity<?> getAttendance(@PathVariable Integer id) {

        return studentService.getStudentAttendance(id);

    }


    @GetMapping("/group/{id}")
    public ResponseEntity<?> getGroup(@PathVariable Integer id) {

        return studentService.getStudentGroup(id);

    }

}