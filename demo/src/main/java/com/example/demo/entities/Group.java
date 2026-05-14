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
@Table(name = "Группа")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Код_группы", nullable = false, unique = true)
    private Integer id;

    @Column(name = "Название_группы", nullable = false, length = 100)
    private String name;

    @Column(name = "Дата_начала")
    private Date startDate;

    @Column(name = "Дата_окончания")
    private Date endDate;

    @ManyToOne
    @JoinColumn(name = "Код_курса")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "Код_преподавателя")
    private Teacher teacher;
    
}