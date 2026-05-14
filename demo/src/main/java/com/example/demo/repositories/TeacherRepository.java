package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.Teacher;


@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Integer> {}
