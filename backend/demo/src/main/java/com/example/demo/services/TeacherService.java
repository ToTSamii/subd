package com.example.demo.services;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.dtos.responseDto.ResponseTeacher.ResponseScheldueTeacher;
import com.example.demo.dtos.responseDto.ResponseTeacher.ResponseSchelduesTeacher;
import com.example.demo.entities.Group;
import com.example.demo.entities.Schedule;
import com.example.demo.entities.Teacher;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.ScheduleRepository;
import com.example.demo.repositories.TeacherRepository;


@Service
public class TeacherService {

    TeacherRepository teacherRepository;
    GroupRepository groupRepository;
    ScheduleRepository scheduleRepository;


    TeacherService(TeacherRepository teacherRepository, 
                    GroupRepository groupRepository, 
                    ScheduleRepository scheduleRepository) {

        this.teacherRepository = teacherRepository;
        this.groupRepository = groupRepository;
        this.scheduleRepository = scheduleRepository;

    }


    //Получение информации о групах преподавателя по id пользвателя
    @Transactional
    public ResponseEntity<?> getTeacherGroups(Integer userId) {

        try {

            Teacher teacher = teacherRepository.findByUser_UserId(userId).orElse(null);

            if (teacher != null) {

                List<Group> groups = groupRepository.findByTeacherCode(teacher.getCode());

                return ResponseEntity.ok(groups);

            } else {

                return ResponseEntity.status(404).body("Преподаватель с id: " + userId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении информации о преподавателе: " + e.getMessage());
        
        }

    }


    //Получение расписания преподавателя по id пользователя
    @Transactional
    public ResponseEntity<?> getTeacherSchedule(Integer userId) {

        try {

            Teacher teacher = teacherRepository.findByUser_UserId(userId).orElse(null);

            if (teacher != null) {

                List<Group> groups = groupRepository.findByTeacherCode(teacher.getCode());
                List<ResponseScheldueTeacher> responseSchelduesTeacher = new ArrayList<>();

                for (Group group : groups) {

                    List<Schedule> schedules = scheduleRepository.findByGroupId(group.getId());

                    for (Schedule schedule : schedules) {
                        
                        ResponseScheldueTeacher responseScheldueTeacher = new ResponseScheldueTeacher();
                        responseScheldueTeacher.setDateTime(schedule.getDateTime());
                        responseScheldueTeacher.setGroupName(schedule.getGroupNameDenorm());
                        responseScheldueTeacher.setTopic(schedule.getTopic());

                        responseSchelduesTeacher.add(responseScheldueTeacher);

                    }

                }

                ResponseSchelduesTeacher responseSchelduesTeacherList = new ResponseSchelduesTeacher();
                responseSchelduesTeacherList.setResponseScheldues(responseSchelduesTeacher);

                return ResponseEntity.ok(responseSchelduesTeacherList);

            } else {

                return ResponseEntity.status(404).body("Преподаватель с id: " + userId + " не найден");
            
            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении информации о преподавателе: " + e.getMessage());

        }

    }

}