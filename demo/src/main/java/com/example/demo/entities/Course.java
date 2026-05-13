package com.example.demo.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "Курс")
public class Course {
    
    @Id
    @Column(name = "Код_курса", nullable = false, unique = true)
    private Integer code;

    @Column(name = "Название", nullable = false, length = 100)
    private String name;

    @Column(name = "Описание")
    private String description;

    @Column(name = "Длительность_часов")
    private Integer durationHours;

    @Column(name = "Стоимость")
    private Double cost;

}