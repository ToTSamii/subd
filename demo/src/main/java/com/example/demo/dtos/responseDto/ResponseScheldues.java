package com.example.demo.dtos.responseDto;

import java.util.List;
import com.example.demo.entities.Schedule;
import lombok.Data;


@Data
public class ResponseScheldues {
 
    private List<Schedule> schedules;
    
}
