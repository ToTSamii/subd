package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.services.ProfileService;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("api/profile")
@Slf4j
public class ProfileController {

    private ProfileService profileService;

    public ProfileController(ProfileService profileService) {

        this.profileService = profileService;

    }


    @GetMapping("/")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {

        return profileService.getProfile(token);
    
    }
    
}
