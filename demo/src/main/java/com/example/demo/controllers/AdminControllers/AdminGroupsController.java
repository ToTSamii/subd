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
import com.example.demo.dtos.requestDto.RequestGroup;
import com.example.demo.services.AdminServices.AdminGroupService;


@RestController
@RequestMapping("/admin/groups")
public class AdminGroupsController {

   private AdminGroupService adminGroupsService;

   
   public AdminGroupsController(AdminGroupService adminGroupsService) {

       this.adminGroupsService = adminGroupsService;

   }


   @GetMapping("/")
   public ResponseEntity<?> getAllGroups() {

       return adminGroupsService.getAllGroups();

   }


   @PostMapping("/")
   public ResponseEntity<?> addGroup(@RequestBody RequestGroup requestGroup) {

       return adminGroupsService.addGroup(requestGroup);

   }


   @PutMapping("/{id}")
   public ResponseEntity<?> updateGroup(@PathVariable @NonNull Integer id, @RequestBody RequestGroup requestGroup) {

      return adminGroupsService.updateGroup(id, requestGroup);

   }


   @DeleteMapping("/{id}")
   public ResponseEntity<?> deleteGroup(@PathVariable @NonNull Integer id) {

       return adminGroupsService.deleteGroup(id);

   }

}