package com.example.demo.dtos.responseDto.ResponseTeacher;

import java.util.List;
import com.example.demo.dtos.responseDto.ResponseGroup;
import lombok.Data;


@Data
public class ResponseGroupsTeacher {

    private List<ResponseGroup> groups;
    
}
