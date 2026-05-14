package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.Group;


@Repository
public interface GroupRepository extends JpaRepository<Group, Integer> {}
