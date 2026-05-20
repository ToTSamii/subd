package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.services.GroupService;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/group")
@Slf4j
public class GroupController {

   private GroupService groupsService;

   
   public GroupController(GroupService groupsService) {

       this.groupsService = groupsService;

   }


   @GetMapping("/all")
   public ResponseEntity<?> getAllGroups() {

       return groupsService.getAllGroups();

   }


   @GetMapping("/course/{id}")
   public ResponseEntity<?> getGroupByCourseId(@PathVariable Integer id) {

        return groupsService.getGroupsByCourse(id);

   }

}