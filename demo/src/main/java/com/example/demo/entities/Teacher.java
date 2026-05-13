package com.example.demo.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Преподаватель")
public class Teacher {
    
    @Id
    @Column(name = "Код_преподавателя", nullable = false, unique = true)
    private String code;

    @Column(name = "Фамилия", nullable = false, length = 100)
    private String lastName;

    @Column(name = "Имя", nullable = false, length = 100)
    private String firstName;

    @Column(name = "Отчество", nullable = false, length = 100)
    private String middleName;

    @Column(name = "Квалификация", nullable = false, length = 50)
    private String qualification;

    @Column(name = "Дата_найма", nullable = false)
    private Date hireDate;

    @Column(name = "Телефон", nullable = true, length = 15)
    private String phoneNumber;
    
}
