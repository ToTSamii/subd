package com.example.demo.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    @Column(name = "Код_группы", nullable = false, unique = true)
    private Integer code;

    @Column(name = "Название_группы", nullable = false, length = 100)
    private String name;

    @Column(name = "Дата_начала")
    private LocalDate startDate;

    @Column(name = "Дата_окончания")
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "Код_курса")
    private Course course;

    @Column(name = "Код_преподавателя")
    private Integer teacherCode; 
}