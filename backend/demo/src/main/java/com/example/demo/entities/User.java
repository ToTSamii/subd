package com.example.demo.entities;

import java.util.Date;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Пользователь")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Код_пользователя", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "Логин", nullable = false, length = 50)
    private String login;

    @Column(name = "Пароль", nullable = false, length = 100)
    private String password;

    @Column(name = "Эл_почта")
    private String email;

    @Column(name = "Дата_регистрации")
    private Date registrationDate;

    @Column(name = "Фотография")
    private String photo;

    @OneToOne
    @JoinColumn(name = "Код_роли")
    private Role role;
    
}
