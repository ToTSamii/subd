package com.example.demo.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Студент")
public class Student {
    
    @Id
    @Column(name = "Код_студента", nullable = false, unique = true)
    private String code;

    @Column(name = "Фамилия", nullable = false, length = 100)
    private String lastName;

    @Column(name = "Имя", nullable = false, length = 100)
    private String firstName;

    @Column(name = "Отчество", nullable = false, length = 100)
    private String middleName;

    @Column(name = "Дата_рождения", nullable = false)
    private LocalDate birthDate;
    
}
