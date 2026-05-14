package com.example.demo.services;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.responseDto.ResponseAttendanceList;
import com.example.demo.dtos.responseDto.ResponseScheldues;
import com.example.demo.entities.Attendance;
import com.example.demo.entities.Schedule;
import com.example.demo.entities.Student;
import com.example.demo.repositories.AttendanceRepository;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.ScheduleRepository;
import com.example.demo.repositories.StudentRepository;

import jakarta.transaction.Transactional;


@Service
public class StudentService {

    StudentRepository studentRepository;
    GroupRepository groupRepository;
    AttendanceRepository attendanceRepository;
    ScheduleRepository scheduleRepository;


    StudentService(StudentRepository studentRepository, 
                 GroupRepository groupRepository, 
                 AttendanceRepository attendanceRepository, 
                 ScheduleRepository scheduleRepository) {

        this.studentRepository = studentRepository;
        this.groupRepository = groupRepository;
        this.attendanceRepository = attendanceRepository;
        this.scheduleRepository = scheduleRepository;

    }


    //Получение расписания для студента по его id
    @Transactional
    public ResponseEntity<?> getStudentSchedule(Integer studentId) {

        try {

            Student student = studentRepository.findById(studentId).orElse(null);
            
            if (student != null) {

                List<Schedule> schedules = scheduleRepository.findByGroupId(student.getGroup().getId());

                ResponseScheldues responseScheldues = new ResponseScheldues();
                responseScheldues.setSchedules(schedules);

                return ResponseEntity.ok(responseScheldues);

            } else {

                return ResponseEntity.status(404).body("Студент с id: " + studentId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении расписания: " + e.getMessage());
        
        }

    }


    //Получение данных об успеваемости студента по его id
    @Transactional
    public ResponseEntity<?> getStudentAttendance(Integer studentId) {

        try {

            Student student = studentRepository.findById(studentId).orElse(null);

            if (student != null) {

                List<Attendance> attendanceList = attendanceRepository.findByStudentCode(studentId);

                ResponseAttendanceList responseAttendanceList = new ResponseAttendanceList();
                responseAttendanceList.setAttendances(attendanceList);

                return ResponseEntity.ok(responseAttendanceList);

            } else {

                return ResponseEntity.status(404).body("Студент с id: " + studentId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении данных об успеваемости: " + e.getMessage());
        
        }

    }


    //Получение группы студента по его id
    @Transactional
    public ResponseEntity<?> getStudentGroup(Integer studentId) {

        try {

            Student student = studentRepository.findById(studentId).orElse(null);

            if (student != null) {

                return ResponseEntity.ok(student.getGroup());

            } else {

                return ResponseEntity.status(404).body("Студент с id: " + studentId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении данных о группе: " + e.getMessage());

        }

    }

}