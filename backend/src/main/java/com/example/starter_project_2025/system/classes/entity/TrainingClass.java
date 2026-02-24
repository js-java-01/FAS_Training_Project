package com.example.starter_project_2025.system.classes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;

@Entity
@Table(name = "classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingClass {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "class_id")
    private UUID id;

    @Column(name = "class_name")
    private String className;

    @OneToMany(mappedBy = "classInfo")
    private List<CourseClass> courseClasses;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}