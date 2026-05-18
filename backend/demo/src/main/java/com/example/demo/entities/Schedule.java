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
@Table(name = "Расписание")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Код_занятия", nullable = false, unique = true)
    private Integer id;
    
    @Column(name = "Дата_время", nullable = false)
    private Date dateTime;

    @Column(name = "Тема_занятия", nullable = false, length = 100)
    private String topic;

    @ManyToOne
    @JoinColumn(name = "Код_группы")  
    private Group group;

    @Column(name = "ФИО_преподавателя_денорм")
    private String teacherFioDenorm;

    @Column(name = "Название_группы_денорм")
    private String groupNameDenorm;

}
