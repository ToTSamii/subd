package com.example.demo.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.requestDto.RequestAddMark;
import com.example.demo.dtos.requestDto.RequestStudentGroup;
import com.example.demo.dtos.responseDto.ResponseGroup;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseScheldue;
import com.example.demo.dtos.responseDto.ResponseStudent.ResponseScheldues;
import com.example.demo.entities.Attendance;
import com.example.demo.entities.Course;
import com.example.demo.entities.Group;
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

                if (attendanceList.isEmpty()) {

                    return ResponseEntity.status(404).body("Нет успеваемости!");

                }

                return ResponseEntity.ok(attendanceList);

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


    //Редактирование группы студента по id пользователя и id группы
    @Transactional
    public ResponseEntity<?> updateStudent(RequestStudentGroup requestStudentGroup) {
        
        try {

            Student student = studentRepository.findByUser_UserId(requestStudentGroup.getUserId()).orElse(null);
            Group group = groupRepository.findById(requestStudentGroup.getGroupId()).orElse(null);

            if (student != null && group != null) {

                student.setGroup(group);
                student = studentRepository.save(student);

                return ResponseEntity.ok(student);
                
            } else {

                return ResponseEntity.status(404).body("Студент или группа не найдены");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при редактировании группы студента: " + e.getMessage());

        }

    }


    //Получение студентов по id группы
    @Transactional
    public ResponseEntity<?> getStudentsByGroup(Integer idGroup) {

        try {

            Group group = groupRepository.findById(idGroup).orElse(null);

            if (group != null) {

                List<Student> studentList = studentRepository.findByGroupId(idGroup);
                
                return ResponseEntity.ok(studentList);

            } else {

                return ResponseEntity.status(404).body("Группа не найдена!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка получения студентов по id группы " + e.getMessage());

        }

    }

}