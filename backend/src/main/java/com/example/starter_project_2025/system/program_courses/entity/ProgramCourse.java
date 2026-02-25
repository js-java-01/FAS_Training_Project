package com.example.starter_project_2025.system.program_courses.entity;

import java.util.UUID;

import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
@Table(name = "program_courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProgramCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programming_language_id")
    @JsonBackReference
    private ProgrammingLanguage programmingLanguage;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_program_id")
    @JsonBackReference
    private TrainingProgram trainingProgram;

}
