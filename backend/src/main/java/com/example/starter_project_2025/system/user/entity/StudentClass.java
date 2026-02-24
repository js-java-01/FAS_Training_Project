package com.example.starter_project_2025.system.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;

@Entity
@Table(name = "student_classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentClass {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "student_class_id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private TrainingClass trainingClass;

    @Column(name = "attending_status")
    private String attendingStatus;

    @Column(name = "result")
    private Double result;

    @Column(name = "final_score")
    private Double finalScore;

    @Column(name = "gpa_level")
    private String gpaLevel;

    @Column(name = "certification_status")
    private String certificationStatus;

    @Column(name = "certification_date")
    private LocalDate certificationDate;

    @Column(name = "method")
    private String method;
}