package com.example.demo.services;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import com.example.demo.dtos.requestDto.RequestUser;
import com.example.demo.dtos.responseDto.ResponseUserList;
import com.example.demo.entities.Role;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UsersService {

    UserRepository userRepository; 

    public UsersService(UserRepository userRepository) { 

        this.userRepository = userRepository;

    }


    //Получение всех пользователей
    @Transactional
    public ResponseEntity<?> getUsers() {

        try {

            List<User> users = new ArrayList<>();
            users = userRepository.findAll();

            ResponseUserList responseUserList = new ResponseUserList();
            responseUserList.setCount(users.size());
            responseUserList.setUsers(users);

            return ResponseEntity.ok(responseUserList);

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error!");
            
        }
    }


    //Добавление пользователя
    @Transactional
    public ResponseEntity<?> addUser(RequestUser requestUser) {

        try {

            User user = new User();
            user.setEmail(requestUser.getEmail());
            user.setLogin(requestUser.getLogin());
            user.setPassword(requestUser.getPassword()); 
            user.setPhoto(requestUser.getPhoto());
            user.setRegistrationDate(requestUser.getRegistrationDate());

            Integer code_role = 1;

            if (requestUser.getRole() != null && requestUser.getRole().equals("Администратор")) {
                
                code_role = 3;
            
            } else if (requestUser.getRole() != null && requestUser.getRole().equals("Преподаватель")) { // Исправлено "Преподоваьтель"
                
                code_role = 2;
            
            }    

            Role role = new Role();
            role.setCode(code_role);
            role.setName(requestUser.getRole() != null ? requestUser.getRole() : "Студент");
            user.setRole(role);

            userRepository.save(user);

            return ResponseEntity.ok("Add user");

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error!");
        
        }

    }


    //Обновление пользователя
    @Transactional
    public ResponseEntity<?> updateUser(@NonNull Integer id, RequestUser requestUser) {

        try {

            if (requestUser != null) {

                User user = userRepository.findById(id).orElse(null);

                if (user != null) {
                    user.setEmail(requestUser.getEmail());
                    user.setPassword(requestUser.getPassword());
                    user.setPhoto(requestUser.getPhoto());
                    user.setRegistrationDate(requestUser.getRegistrationDate());

                    Integer code_role = 3;

                    if (requestUser.getRole() != null && requestUser.getRole().equals("Администратор")) {

                        code_role = 1;

                    } else if (requestUser.getRole() != null && requestUser.getRole().equals("Преподаватель")) { // Исправлено "Преподоваьтель"

                        code_role = 2;

                    }

                    Role role = new Role();
                    role.setCode(code_role);
                    role.setName(requestUser.getRole() != null ? requestUser.getRole() : "Студент");
                    user.setRole(role);

                }

                User new_user = userRepository.save(user != null ? user : new User());
                
                return ResponseEntity.ok(new_user);

            } else {

                return ResponseEntity.status(400).body("Bad Request!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error!");

        }

    }


    //Удаление пользователя
    @Transactional
    public ResponseEntity<?> deleteUser(Integer id) {

        try {

            if (id != null) {

                userRepository.deleteById(id);
                return ResponseEntity.ok("Successfully deleted user");
            
            } else {

                return ResponseEntity.status(400).body("Bad Request!");

            }

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Service Error!");

        }

    }

}