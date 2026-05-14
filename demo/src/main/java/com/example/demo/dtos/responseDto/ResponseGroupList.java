package com.example.demo.dtos.responseDto;

import java.util.List;
import com.example.demo.entities.Group;
import lombok.Data;

@Data
public class ResponseGroupList {
    
    private Integer count;
    private List<Group> groups;

}
