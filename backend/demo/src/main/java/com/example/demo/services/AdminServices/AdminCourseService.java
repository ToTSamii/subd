package com.example.demo.services.AdminServices;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.requestDto.RequestCourse;
import com.example.demo.entities.Course;
import com.example.demo.repositories.CourseRepository;


@Service
public class AdminCourseService {

    private CourseRepository courseRepository;

    public AdminCourseService(CourseRepository courseRepository) {

        this.courseRepository = courseRepository;

    }


    //Добавление нового курса
    @Transactional
    public ResponseEntity<?> addCourse(RequestCourse requestCourse) {

        try {

            Course course = new Course();
            course.setName(requestCourse.getName());
            course.setDescription(requestCourse.getDescription());
            course.setDurationHours(requestCourse.getDurationHours());
            course.setCost(requestCourse.getCost());

            course = courseRepository.save(course);

            return ResponseEntity.ok(course);

        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Ошибка добавления курса");

        }

    }


    //Изменение курса по его id
    @Transactional
    public ResponseEntity<?> updateCourse(Integer courseId, RequestCourse requestCourse) {

        try {

            Course course = courseRepository.findById(courseId).orElse(null);

            if (course != null) {

                course.setName(requestCourse.getName());
                course.setDescription(requestCourse.getDescription());
                course.setDurationHours(requestCourse.getDurationHours());
                course.setCost(requestCourse.getCost());
                course = courseRepository.save(course);

                return ResponseEntity.ok(course);

            } else {

                return ResponseEntity.status(404).body("Курс не найден!");


            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка изменения курса!");

        }

    }


    //Удаление курса по его id
    @Transactional
    public ResponseEntity<?> deleteCourse(Integer courseId) {

        try {

            Course course = courseRepository.findById(courseId).orElse(null);

            if (course != null) {

                courseRepository.delete(course);
                return ResponseEntity.ok("Курс успешно удален!");

            } else {

                return ResponseEntity.status(404).body("Курс не найден!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка удаления курса!");

        }

    }
    
}