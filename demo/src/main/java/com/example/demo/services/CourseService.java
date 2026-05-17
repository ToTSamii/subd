package com.example.demo.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.repositories.CourseRepository;


@Service
public class CourseService {

    private CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {

        this.courseRepository = courseRepository;

    }


    // Получение всех курсов
    @Transactional
    public ResponseEntity<?> getAllCourses() {

        try {

            return ResponseEntity.ok(courseRepository.findAll());

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении курсов: " + e.getMessage());

        }

    }
    
}