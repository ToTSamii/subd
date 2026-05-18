package com.example.demo.controllers.AdminControllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.requestDto.RequestCourse;
import com.example.demo.services.AdminServices.AdminCourseService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/course")
@Slf4j
public class AdminCourseController {

    private AdminCourseService adminCourseService;
    
    public AdminCourseController(AdminCourseService adminCourseService) {

        this.adminCourseService = adminCourseService;
    } 

    
    @PostMapping("/")
    public ResponseEntity<?> addCourse(@RequestBody RequestCourse requestCourse){

        return adminCourseService.addCourse(requestCourse);

    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Integer id, @RequestBody RequestCourse requestCourse) {

        return adminCourseService.updateCourse(id, requestCourse);

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Integer id) {

        return adminCourseService.deleteCourse(id);

    }

}