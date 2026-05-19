package com.example.demo.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.requestDto.RequestSchedule;
import com.example.demo.entities.Group;
import com.example.demo.entities.Schedule;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.ScheduleRepository;


@Service
public class ScheduleService {

    private ScheduleRepository scheduleRepository;
    private GroupRepository groupRepository;

    public ScheduleService(ScheduleRepository scheduleRepository,
                            GroupRepository groupRepository) {

        this.scheduleRepository = scheduleRepository;
        this.groupRepository = groupRepository;

    }


    //Получение всех расписаний
    @Transactional
    public ResponseEntity<?> getAllSchedule() {

        try {

            return ResponseEntity.ok(scheduleRepository.findAll());

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка получения всех расписаний. " + e.getMessage());

        }

    }


    //Добавление нового расписания
    @Transactional
    public ResponseEntity<?> addSchedule(RequestSchedule requestSchedule) {

        try {

            Schedule schedule = new Schedule();
            
            schedule.setTopic(requestSchedule.getTopic());
            schedule.setDateTime(requestSchedule.getDateTime());

            Group group = groupRepository.findById(requestSchedule.getGroupId()).orElse(null);
            
            if (group != null) {

                schedule.setGroup(group);
                schedule.setGroupNameDenorm(group.getName());
                schedule.setTeacherFioDenorm(group.getTeacher().getLastName() + " " 
                                            + group.getTeacher().getFirstName() + " "
                                            + group.getTeacher().getMiddleName());            

            } else {

                schedule.setGroup(null);
                schedule.setGroupNameDenorm(null);
                schedule.setTeacherFioDenorm(null);

            }

            schedule = scheduleRepository.save(schedule);

            return ResponseEntity.ok(schedule);


        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка добавления нового расписания. " + e.getMessage());

        }

    }


    //Изменение существующего расписания по его id
    @Transactional
    public ResponseEntity<?> updateSchedule(Integer id, RequestSchedule requestSchedule) {

        try {

            Schedule schedule = scheduleRepository.findById(id).orElse(null);

            if (schedule != null) {

                schedule.setTopic(requestSchedule.getTopic());
                schedule.setDateTime(requestSchedule.getDateTime());

                Group group = groupRepository.findById(requestSchedule.getGroupId()).orElse(null);
                
                if (group != null) {

                    schedule.setGroup(group);
                    schedule.setGroupNameDenorm(group.getName());
                    schedule.setTeacherFioDenorm(group.getTeacher().getLastName() + " " 
                                                + group.getTeacher().getFirstName() + " "
                                                + group.getTeacher().getMiddleName());            

                } else {

                    schedule.setGroup(null);
                    schedule.setGroupNameDenorm(null);
                    schedule.setTeacherFioDenorm(null);

                }

                schedule = scheduleRepository.save(schedule);

                return ResponseEntity.ok(schedule);

            } else {

                return ResponseEntity.status(404).body("Расписание не найдено");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка редактирования расписания " + e.getMessage());

        }

    }


    //Удаление расписания по его id
    @Transactional
    public ResponseEntity<?> deleteSchedule(Integer id) {

        try {

            Schedule schedule = scheduleRepository.findById(id).orElse(null);

            if (schedule != null) {

                scheduleRepository.delete(schedule);

                return ResponseEntity.ok().body("Расписание удалено");
                
            } else {

                return ResponseEntity.status(404).body("Расписание не найдено");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка удаления расписания " + e.getMessage());

        }

    }
    
}
