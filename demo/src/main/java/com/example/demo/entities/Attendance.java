package com.example.demo.entities;

import java.util.Date;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "Успеваемость")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Код_записи", nullable = false, unique = true)
    private Integer id;
    
    @Column(name = "Оценка", nullable = false)
    private Integer grade;

    @Column(name = "Дата_выставления", nullable = false)
    private Date date;

    @ManyToOne
    @JoinColumn(name = "Код_студента")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "Код_группы")
    private Group group;

    @Column(name = "Название_курса_денорм")
    private String courseNameDenorm;
}