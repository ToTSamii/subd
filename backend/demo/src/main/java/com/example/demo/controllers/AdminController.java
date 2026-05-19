package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.requestDto.RequestCourse;
import com.example.demo.dtos.requestDto.RequestUser;
import com.example.demo.services.CourseService;
import com.example.demo.services.ScheduleService;
import com.example.demo.services.UsersService;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/admin")
@Slf4j
public class AdminController {

    private ScheduleService scheduleService;
    private CourseService courseService; 
    private UsersService usersService;

    public AdminController(ScheduleService scheduleService,
                            CourseService courseService, 
                            UsersService usersService) {   

        this.scheduleService = scheduleService;
        this.courseService = courseService;
        this.usersService = usersService;

    }

    
    //Расписание

    @GetMapping("/schedule/all")
    public ResponseEntity<?> getSchedules() {

        return scheduleService.getAllSchedule();
        
    }


    //Курсы

    @PostMapping("/course")
    public ResponseEntity<?> addCourse(@RequestBody RequestCourse requestCourse){

        return courseService.addCourse(requestCourse);

    }


    @PutMapping("/course/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Integer id, @RequestBody RequestCourse requestCourse) {

        return courseService.updateCourse(id, requestCourse);

    }


    @DeleteMapping("/course/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Integer id) {

        return courseService.deleteCourse(id);

    }


    //Пользователи

    @GetMapping("/")
    public ResponseEntity<?> getUsers() {

        return usersService.getUsers();

    }


    @PostMapping("/")
    public ResponseEntity<?> addUser(@RequestBody RequestUser requestUser) {

        return usersService.addUser(requestUser);

    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody RequestUser requestUser) {

       return usersService.updateUser(id, requestUser);

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {

       return usersService.deleteUser(id);

    }
    
}
