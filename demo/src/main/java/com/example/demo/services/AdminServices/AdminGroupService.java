package com.example.demo.services.AdminServices;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import com.example.demo.dtos.requestDto.RequestGroup;
import com.example.demo.dtos.responseDto.ResponseGroupList;
import com.example.demo.entities.Course;
import com.example.demo.entities.Group;
import com.example.demo.entities.Teacher;
import com.example.demo.repositories.CourseRepository;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.TeacherRepository;

import jakarta.transaction.Transactional;


@Service
public class AdminGroupService {
    
    GroupRepository groupRepository;
    CourseRepository courseRepository; 
    TeacherRepository teacherRepository;

    public AdminGroupService(GroupRepository groupRepository, 
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

            return ResponseEntity.status(500).body("Service Error!");
            
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

            return ResponseEntity.status(500).body("Service Error!");
        
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

            return ResponseEntity.status(500).body("Service Error!");

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

            return ResponseEntity.status(500).body("Service Error!");

        }

    }
}
