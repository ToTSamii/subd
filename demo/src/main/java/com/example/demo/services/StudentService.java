package com.example.demo.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.responseDto.ResponseStudent.ResponseAttendance;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseAttendanceList;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseGroup;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseScheldue;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseScheldues;
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
                List<ResponseScheldue> responsesScheldueList = new ArrayList<>();

                for (Schedule schedule : schedules) {
                    
                    ResponseScheldue responseScheldue = new ResponseScheldue();
                    responseScheldue.setDateTime(schedule.getDateTime());
                    responseScheldue.setTopic(schedule.getTopic());
                    responseScheldue.setGroupName(schedule.getGroupNameDenorm());
                    responseScheldue.setTeacherFio(schedule.getTeacherFioDenorm());
                    
                    responsesScheldueList.add(responseScheldue);
                    
                }

                ResponseScheldues responseScheldues = new ResponseScheldues();
                responseScheldues.setSchedules(responsesScheldueList);

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
                List<ResponseAttendance> responsesAttendances = new ArrayList<>();

                for (Attendance attendance : attendanceList) {

                    ResponseAttendance responseAttendance = new ResponseAttendance();
                    responseAttendance.setGrade(attendance.getGrade());
                    responseAttendance.setDate(attendance.getDate());
                    responseAttendance.setCourseName(attendance.getCourseNameDenorm());

                    responsesAttendances.add(responseAttendance);

                }

                ResponseAttendanceList responseAttendanceList = new ResponseAttendanceList();
                responseAttendanceList.setAttendances(responsesAttendances);

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

                ResponseGroup responseGroup = new ResponseGroup();
                responseGroup.setName(student.getGroup().getName());
                responseGroup.setCourseName(student.getGroup().getCourse().getName());
                responseGroup.setStartDate(student.getGroup().getStartDate());
                responseGroup.setEndDate(student.getGroup().getEndDate());

                return ResponseEntity.ok(responseGroup);

            } else {

                return ResponseEntity.status(404).body("Студент с id: " + studentId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении данных о группе: " + e.getMessage());

        }

    }

}