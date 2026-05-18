package com.example.demo.controllers.AdminControllers;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.requestDto.RequestUser;
import com.example.demo.services.AdminServices.AdminUsersService;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/admin/users")
@Slf4j
public class AdminUsersCntroller {

    private AdminUsersService adminService;

    
    public AdminUsersCntroller(AdminUsersService adminService) {

        this.adminService = adminService;

    }


    @GetMapping("/")
    public ResponseEntity<?> getUsers() {

        return adminService.getUsers();

    }


    @PostMapping("/")
    public ResponseEntity<?> addUser(@RequestBody RequestUser requestUser) {

        return adminService.addUser(requestUser);

    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable @NonNull Integer id, @RequestBody RequestUser requestUser) {

       return adminService.updateUser(id, requestUser);

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {

       return adminService.deleteUser(id);

    }

    
}