package com.example.demo.dtos.responseDto;

import java.util.List;
import com.example.demo.entities.User;
import lombok.Data;

@Data
public class ResponseUserList {
    
    private Integer count;
    private List<User> users;

}
