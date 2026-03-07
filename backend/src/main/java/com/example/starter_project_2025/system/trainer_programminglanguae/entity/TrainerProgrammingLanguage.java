package com.example.starter_project_2025.system.trainer_programminglanguae.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.starter_project_2025.system.programming_language.ProgrammingLanguage;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.starter_project_2025.system.rbac.user.User;
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
@Table(name = "trainer_programming_languages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainerProgrammingLanguage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    @JoinColumn(name = "trainer_id", nullable = false)
    @JsonBackReference
    private User trainer;
    @ManyToOne
    @JoinColumn(name = "programming_language_id", nullable = false)
    @JsonBackReference
    private ProgrammingLanguage programmingLanguage;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
