package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.services.CourseService;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/courses")
@Slf4j
public class CoursesController {

    private CourseService courseService;

    public CoursesController(CourseService courseService) {

        this.courseService = courseService;

    }


    @GetMapping("/")
    public ResponseEntity<?> listCourses() {

        return courseService.getAllCourses();

    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(Integer id) {

        return courseService.getCourseById(id);

    }
    
}