package com.example.demo.services;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.dtos.responseDto.ResponseGroup;
import com.example.demo.dtos.responseDto.ResponseTeacher.ResponseGroupsTeacher;
import com.example.demo.entities.Group;
import com.example.demo.entities.Teacher;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.TeacherRepository;


@Service
public class TeacherService {

    TeacherRepository teacherRepository;
    GroupRepository groupRepository;


    TeacherService(TeacherRepository teacherRepository, GroupRepository groupRepository) {

        this.teacherRepository = teacherRepository;
        this.groupRepository = groupRepository;

    }


    //Получение информации о групах преподавателя по его id
    @Transactional
    public ResponseEntity<?> getTeacherGroups(Integer teacherId) {

        try {

            Teacher teacher = teacherRepository.findById(teacherId).orElse(null);

            if (teacher != null) {

                ResponseGroupsTeacher responseGroupsTeacher = new ResponseGroupsTeacher();

                List<Group> groups = groupRepository.findByTeacherCode(teacherId);
                List<ResponseGroup> responseGroups = new ArrayList<>();

                for (Group group : groups) {
                    
                    ResponseGroup responseGroup = new ResponseGroup();
                    responseGroup.setName(group.getName());
                    responseGroup.setStartDate(group.getStartDate());
                    responseGroup.setEndDate(group.getEndDate());
                    responseGroup.setCourseName(group.getCourse().getName());

                    responseGroups.add(responseGroup);

                }

                responseGroupsTeacher.setGroups(responseGroups);

                return ResponseEntity.ok(responseGroupsTeacher);

            } else {

                return ResponseEntity.status(404).body("Преподаватель с id: " + teacherId + " не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка при получении информации о преподавателе: " + e.getMessage());
        
        }

    }


}