package com.example.demo.controllers;

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
import com.example.demo.dtos.requestDto.RequestGroup;
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


   @GetMapping("/{id}")
   public ResponseEntity<?> getGroup(@PathVariable @NonNull Integer id) {

       return groupsService.getGroupById(id);

   }


   @PostMapping("/")
   public ResponseEntity<?> addGroup(@RequestBody RequestGroup requestGroup) {

       return groupsService.addGroup(requestGroup);

   }


   @PutMapping("/{id}")
   public ResponseEntity<?> updateGroup(@PathVariable @NonNull Integer id, @RequestBody RequestGroup requestGroup) {

      return groupsService.updateGroup(id, requestGroup);

   }


   @DeleteMapping("/{id}")
   public ResponseEntity<?> deleteGroup(@PathVariable @NonNull Integer id) {

       return groupsService.deleteGroup(id);

   }

}