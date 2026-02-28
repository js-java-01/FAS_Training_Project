package com.example.starter_project_2025.system.course_programing_language.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "course_programming_languages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseProgrammingLanguage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference
    private Course course;
    @ManyToOne
    @JoinColumn(name = "programming_language_id", nullable = false)
    @JsonBackReference
    private ProgrammingLanguage programmingLanguage;
    @CreationTimestamp
    private LocalDateTime createdDate;
    @UpdateTimestamp
    private LocalDateTime updatedDate;

}
