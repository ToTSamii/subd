package com.example.demo.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.responseDto.ResponsesProfile.ResponseAdminProfile;
import com.example.demo.dtos.responseDto.ResponsesProfile.ResponseStudentProfile;
import com.example.demo.dtos.responseDto.ResponsesProfile.ResponseTeacherProfile;
import com.example.demo.entities.Student;
import com.example.demo.entities.Teacher;
import com.example.demo.entities.User;
import com.example.demo.repositories.StudentRepository;
import com.example.demo.repositories.TeacherRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.AuthServices.JwtService;

import jakarta.transaction.Transactional;


@Service
public class ProfileService {

    StudentRepository studentRepository;
    TeacherRepository teacherRepository;
    UserRepository userRepository;
    JwtService jwtService;

    public ProfileService(StudentRepository studentRepository,
                        TeacherRepository teacherRepository,
                        UserRepository userRepository,
                        JwtService jwtService) {

        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    
    }


    //Общий метод полчения профиля, определяющий тип пользователя
    @Transactional
    public ResponseEntity<?> getProfile(String token) {

        try {

            String login = jwtService.parseLogin(token.substring(7));
            User user = userRepository.findByLogin(login).orElse(null);

            if (user != null) {

                Integer code_role = user.getRole().getCode();

                switch (code_role) {

                    case 1:
                        return getStudentProfile(user.getUserId());

                    case 2:
                       return getTeacherProfile(user.getUserId());
  
                    case 3:
                        return getAdminProfile(user.getUserId());

                    default:
                        return ResponseEntity.status(403).body("Пользователь не авторизован");

                }

            } else {

                return ResponseEntity.status(404).body("Пользователь не найден!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Произошла ошибка при получении профиля пользователя");

        }

    }


    //Получение профиля студента
    @Transactional
    public ResponseEntity<?> getStudentProfile(Integer studentId) {

        try {

            Student student = studentRepository.findByUser_UserId(studentId).orElse(null);

            if (student != null) {

                ResponseStudentProfile responseStudentProfile = new ResponseStudentProfile();

                responseStudentProfile.setFirstName(student.getFirstName());
                responseStudentProfile.setLastName(student.getLastName());
                responseStudentProfile.setMiddleName(student.getMiddleName());
                responseStudentProfile.setBirthDate(student.getBirthDate());
                responseStudentProfile.setEmail(student.getUser().getEmail());
                responseStudentProfile.setLogin(student.getUser().getLogin());
                responseStudentProfile.setPhoto(student.getUser().getPhoto());
                responseStudentProfile.setCourseName(student.getGroup().getCourse().getName());
                responseStudentProfile.setGroupName(student.getGroup().getName());
                responseStudentProfile.setRoleName(student.getUser().getRole().getName());

                return ResponseEntity.ok(responseStudentProfile);

            } else {

                return ResponseEntity.status(404).body("Студент не найден!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Произошла ошибка при получении профиля студента.");
        
        }

    }


    //Получение профиля преподавателя
    @Transactional
    public ResponseEntity<?> getTeacherProfile(Integer teacherId) {

        try {

            Teacher teacher = teacherRepository.findByUser_UserId(teacherId).orElse(null);

            if (teacher != null) {

                ResponseTeacherProfile responseTeacherProfile = new ResponseTeacherProfile();

                responseTeacherProfile.setFirstName(teacher.getFirstName());
                responseTeacherProfile.setLastName(teacher.getLastName());
                responseTeacherProfile.setMiddleName(teacher.getMiddleName());
                responseTeacherProfile.setQualification(teacher.getQualification());
                responseTeacherProfile.setEmail(teacher.getUser().getEmail());
                responseTeacherProfile.setLogin(teacher.getUser().getLogin());
                responseTeacherProfile.setPhoto(teacher.getUser().getPhoto());
                responseTeacherProfile.setRoleName(teacher.getUser().getRole().getName());
                responseTeacherProfile.setHireDate(teacher.getHireDate());
                responseTeacherProfile.setPhoneNumber(teacher.getPhoneNumber());

                return ResponseEntity.ok(responseTeacherProfile);

            } else {

                return ResponseEntity.status(404).body("Преподаватель не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Произошла ошибка при получении профиля преподавателя.");

        }

    }


    //Получение профиля администратора
    @Transactional
    public ResponseEntity<?> getAdminProfile(Integer adminId) {

        try {

            User admin = userRepository.findById(adminId).orElse(null);

            if (admin != null) {

                ResponseAdminProfile responseAdminProfile = new ResponseAdminProfile();

                responseAdminProfile.setEmail(admin.getEmail());
                responseAdminProfile.setLogin(admin.getLogin());
                responseAdminProfile.setRoleName(admin.getRole().getName());
                responseAdminProfile.setPhoto(admin.getPhoto());

                return ResponseEntity.ok(responseAdminProfile);

            } else {

                return ResponseEntity.status(404).body("Пользователь не найден");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Произошла ошибка при получении профиля администратора.");

        }

    }

}