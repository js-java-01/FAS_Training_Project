package com.example.starter_project_2025.system.class_session_config.entity;

import java.time.DayOfWeek;
import java.util.UUID;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.shift.entity.Shift;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ClassSessionConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_class_id", nullable = false)
    private CourseClass courseClass;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;
}
