package com.example.demo.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Студент")
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "student_seq")
    @SequenceGenerator(
        name = "student_seq", 
        sequenceName = "Студент_Код_студента_seq", 
        allocationSize = 1  //заставляет Hibernate каждый раз спрашивать sequence
    )
    @Column(name = "Код_студента", nullable = false, unique = true)
    private Integer code;

    @Column(name = "Фамилия", nullable = false, length = 100)
    private String lastName;

    @Column(name = "Имя", nullable = false, length = 100)
    private String firstName;

    @Column(name = "Отчество", length = 100)
    private String middleName;

    @Column(name = "Дата_рождения", nullable = false)
    private Date birthDate;

    @OneToOne
    @JoinColumn(name="Код_пользователя", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "Код_группы", nullable = true)
    private Group group;
    
}
