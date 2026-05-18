package com.example.demo.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entities.Course;
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


    // Получение одного курса по его id
    @Transactional
    public ResponseEntity<?> getCourseById(Integer courseId) {

        try {

            Course course = courseRepository.findById(courseId).orElse(null);

            if (course != null) {

                return ResponseEntity.ok(courseRepository.findById(courseId));

            } else {

                return ResponseEntity.status(404).body("Курс не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении курса: " + e);

        }
                
    }
    
}