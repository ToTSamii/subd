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
@Table(name = "Роли")
public class Role {

    @Id
    @Column(name = "Код_роли", nullable = false, unique = true)
    private String code;

    @Column(name = "Название_роли", nullable = false, length = 100)
    private String name;
    
}