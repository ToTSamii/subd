package com.example.demo.services;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import com.example.demo.dtos.requestDto.RequestGroup;
import com.example.demo.dtos.responseDto.ResponseGroup;
import com.example.demo.dtos.responseDto.ResponseGroupList;
import com.example.demo.entities.Course;
import com.example.demo.entities.Group;
import com.example.demo.entities.Teacher;
import com.example.demo.repositories.CourseRepository;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.TeacherRepository;

import jakarta.transaction.Transactional;


@Service
public class GroupService {
    
    GroupRepository groupRepository;
    CourseRepository courseRepository; 
    TeacherRepository teacherRepository;

    public GroupService(GroupRepository groupRepository, 
                            CourseRepository courseRepository, 
                            TeacherRepository teacherRepository) { 

        this.groupRepository = groupRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;

    }


    // Получение всех групп
    @Transactional
    public ResponseEntity<?> getAllGroups() {

        try {

            List<Group> groups = groupRepository.findAll();
            ResponseGroupList responseGroupList = new ResponseGroupList();
            responseGroupList.setCount(groups.size());
            responseGroupList.setGroups(groups);

            return ResponseEntity.ok(responseGroupList);

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error! " + e.getMessage());
            
        }
    }


    //Получение группы по её id
    @Transactional
    public ResponseEntity<?> getGroupById(Integer id) {

        try {

            Group group = groupRepository.findById(id).orElse(null);

            if (group != null) {

                ResponseGroup responseGroup = new ResponseGroup();
                responseGroup.setName(group.getName());
                responseGroup.setCourseName(group.getCourse().getName());
                responseGroup.setEndDate(group.getEndDate());
                responseGroup.setStartDate(group.getStartDate());

                return ResponseEntity.ok(responseGroup);

            } else {

                return ResponseEntity.status(404).body("Группа не найдена");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Ошибка получения группы " + e.getMessage());

        }

    }


    // Добавление группы
    @Transactional
    public ResponseEntity<?> addGroup(RequestGroup requestGroup) {

        try {

            Group group = new Group();
            group.setName(requestGroup.getName());
            group.setStartDate(requestGroup.getStartDate());
            group.setEndDate(requestGroup.getEndDate());

            Course course = courseRepository.findById(requestGroup.getCourseCode())
                                                                .orElse(null);

            group.setCourse(course);

            Teacher teacher = teacherRepository.findById((Integer) requestGroup.getTeacherCode())
                                                           .orElse(null);   

            group.setTeacher(teacher);

            groupRepository.save(group);

            return ResponseEntity.ok("Add group");

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error! " + e.getMessage());
        
        }

    }


    // Обновление группы
    @Transactional
    public ResponseEntity<?> updateGroup(@NonNull Integer id, RequestGroup requestGroup) {

        try {

            if (requestGroup != null) {

                Group group = groupRepository.findById(id).orElse(null);

                if (group == null) {
                    return ResponseEntity.status(400).body("Group not found!");
                }

                group.setName(requestGroup.getName());
                group.setStartDate(requestGroup.getStartDate());
                group.setEndDate(requestGroup.getEndDate());

                Course course = courseRepository.findById(requestGroup.getCourseCode())
                                                                .orElse(null);

                group.setCourse(course);

                Teacher teacher = teacherRepository.findById((Integer) requestGroup.getTeacherCode())
                                                           .orElse(null);   

                group.setTeacher(teacher);
                
                Group updatedGroup = groupRepository.save(group);
                return ResponseEntity.ok(updatedGroup);

            } else {

                return ResponseEntity.status(400).body("Bad Request!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error! " + e.getMessage());

        }

    }


    // Удаление группы
    @Transactional
    public ResponseEntity<?> deleteGroup(Integer id) {

        try {

            if (id != null) {

                groupRepository.deleteById(id);
                return ResponseEntity.ok("Successfully deleted group");
            
            } else {

                return ResponseEntity.status(400).body("Bad Request!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error! " + e.getMessage());

        }

    }
}
