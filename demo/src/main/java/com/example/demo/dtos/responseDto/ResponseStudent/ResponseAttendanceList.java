package com.example.demo.dtos.responseDto.ResponseStudent;

import java.util.List;
import lombok.Data;


@Data
public class ResponseAttendanceList {

    private List<ResponseAttendance> attendances;
    
}
