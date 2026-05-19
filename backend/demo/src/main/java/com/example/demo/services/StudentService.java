package com.example.demo.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.requestDto.RequestAddMark;
import com.example.demo.dtos.responseDto.ResponseGroup;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseAttendance;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseAttendanceList;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseScheldue;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseScheldues;
import com.example.demo.entities.Attendance;
import com.example.demo.entities.Course;
import com.example.demo.entities.Schedule;
import com.example.demo.entities.Student;
import com.example.demo.repositories.AttendanceRepository;
import com.example.demo.repositories.CourseRepository;
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
    CourseRepository courseRepository;


    StudentService(StudentRepository studentRepository, 
                GroupRepository groupRepository, 
                AttendanceRepository attendanceRepository, 
                ScheduleRepository scheduleRepository,
                CourseRepository courseRepository) {

        this.studentRepository = studentRepository;
        this.groupRepository = groupRepository;
        this.attendanceRepository = attendanceRepository;
        this.scheduleRepository = scheduleRepository;
        this.courseRepository = courseRepository;

    }


    //Получение расписания для студента по по id пользователя
    @Transactional
    public ResponseEntity<?> getStudentSchedule(Integer userId) {

        try {

            Student student = studentRepository.findByUser_UserId(userId).orElse(null);
            
            if (student != null) {

                if (student.getGroup() == null) {return ResponseEntity.status(404).body("Студент не привязан к группе!");}

                List<Schedule> schedules = scheduleRepository.findByGroupId(student.getGroup().getId());
                List<ResponseScheldue> responsesScheldueList = new ArrayList<>();

                if (schedules.isEmpty()) {

                    return ResponseEntity.status(404).body("Нет расписания!");

                }

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

                return ResponseEntity.status(404).body("Студент с id: " + userId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении расписания: " + e.getMessage());
        
        }

    }


    //Получение данных об успеваемости студента по id пользователя
    @Transactional
    public ResponseEntity<?> getStudentAttendance(Integer userId) {

        try {

            Student student = studentRepository.findByUser_UserId(userId).orElse(null);

            if (student != null) {

                List<Attendance> attendanceList = attendanceRepository.findByStudentCode(student.getCode());
                List<ResponseAttendance> responsesAttendances = new ArrayList<>();

                if (attendanceList.isEmpty()) {

                    return ResponseEntity.status(404).body("Нет успеваемости!");

                }

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

                return ResponseEntity.status(404).body("Студент с id: " + userId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении данных об успеваемости: " + e.getMessage());
        
        }

    }


    //Получение группы студента по id пользователя
    @Transactional
    public ResponseEntity<?> getStudentGroup(Integer userId) {

        try {

            Student student = studentRepository.findByUser_UserId(userId).orElse(null);

            if (student != null) {

                if (student.getGroup() == null) {

                    return ResponseEntity.status(404).body("Нет успеваемости!");

                }

                ResponseGroup responseGroup = new ResponseGroup();
                responseGroup.setName(student.getGroup().getName());
                responseGroup.setCourseName(student.getGroup().getCourse().getName());
                responseGroup.setStartDate(student.getGroup().getStartDate());
                responseGroup.setEndDate(student.getGroup().getEndDate());

                return ResponseEntity.ok(responseGroup);

            } else {

                return ResponseEntity.status(404).body("Студент с id: " + userId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении данных о группе: " + e.getMessage());

        }

    }


    //Возможность добавления отметки студенту по id пользователя и id курса (Может только учитель или админ)
    @Transactional
    public ResponseEntity<?> addStudentMark(RequestAddMark requestAddMark) {

        try {

            Student student = studentRepository.findById(requestAddMark.getStudentId()).orElse(null);
            Course course = courseRepository.findById(requestAddMark.getCourseId()).orElse(null);

            if (student != null && course != null) {

                Attendance attendance = new Attendance();
                attendance.setGrade(requestAddMark.getGrade());
                attendance.setDate(new Date());
                attendance.setStudent(student);
                attendance.setCourse(course);
                attendance.setCourseNameDenorm(course.getName());

                attendance = attendanceRepository.save(attendance);

                return ResponseEntity.ok(attendance);

                
            } else {

                return ResponseEntity.status(404).body("Студент или курс не найдены");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка добавления отметки студенту");

        }

    }

}