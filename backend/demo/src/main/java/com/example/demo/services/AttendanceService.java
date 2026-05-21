package com.example.demo.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.requestDto.AttendanceRequest;
import com.example.demo.entities.Attendance;
import com.example.demo.entities.Course;
import com.example.demo.entities.Student;
import com.example.demo.repositories.AttendanceRepository;
import com.example.demo.repositories.CourseRepository;
import com.example.demo.repositories.StudentRepository;


@Service
public class AttendanceService {

    private AttendanceRepository attendanceRepository;
    private StudentRepository studentRepository;
    private CourseRepository courseRepository;


    public AttendanceService(AttendanceRepository attendanceRepository,
                            StudentRepository studentRepository,
                            CourseRepository courseRepository) {

        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;

    }


    //Добавление новой успеваемости по студенту и курсу
    @Transactional
    public ResponseEntity<?> addAttedance(AttendanceRequest attendanceRequest) {

        try {

            Student student = studentRepository.findByUser_UserId(attendanceRequest.getStudentId()).orElse(null);
            Course course = courseRepository.findById(attendanceRequest.getCourseId()).orElse(null);

            if (student == null || course == null) {

                return ResponseEntity.badRequest().body("Не найден студент или курс!");

            }

            Attendance attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setCourse(course);
            attendance.setGrade(attendanceRequest.getGrade());
            attendance.setDate(attendanceRequest.getDate());
            attendance.setCourseNameDenorm(course.getName());

            attendance = attendanceRepository.save(attendance);

            return ResponseEntity.ok(attendance);

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка добавления успеваемости " + e.getMessage());

        }

    }


    //Изменение успеваемости по её id
    @Transactional
    public ResponseEntity<?> updateAttendance(Integer id, AttendanceRequest attendanceRequest) {

        try {

            Attendance attendance = attendanceRepository.findById(id).orElse(null);
            Course course = courseRepository.findById(attendanceRequest.getCourseId()).orElse(null);
            Student student = studentRepository.findByUser_UserId(attendanceRequest.getStudentId()).orElse(null);
            
            if (attendance != null && course != null && student != null) {

                attendance.setCourse(course);
                attendance.setGrade(attendanceRequest.getGrade());
                attendance.setDate(attendanceRequest.getDate());
                attendance.setCourseNameDenorm(course.getName());
                attendance.setStudent(student);

                attendance = attendanceRepository.save(attendance);

                return ResponseEntity.ok(attendance);

            } else {

                return ResponseEntity.status(404).body("Успеваемость не найдена!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка изменения успеваемости " + e.getMessage());

        }

    }


    //Удаление успеваемости по её id
    @Transactional
    public ResponseEntity<?> deleteAttendance(Integer id) {

        try {

            Attendance attendance = attendanceRepository.findById(id).orElse(null);

            if (attendance != null) {

                attendanceRepository.delete(attendance);

                return ResponseEntity.ok("Успеваемость успешно удалена!");

            } else {

                return ResponseEntity.status(404).body("Успеваемость не найдена!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка удаления успеваемости " + e.getMessage());

        }

    }
    
}
