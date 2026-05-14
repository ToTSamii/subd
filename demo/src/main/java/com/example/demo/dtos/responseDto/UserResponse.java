package com.example.demo.dtos.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {

    private Integer userId;
    private String login;
    private String email;
    private String roleName;

}
