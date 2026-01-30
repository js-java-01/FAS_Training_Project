package com.example.starter_project_2025.system.assessment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {
    @Id
    @NotBlank(message = "id must not be blank")

    private String id;

    @NotBlank(message = "name is required")
    @Size(min = 5, max = 255, message = "name must be at most 255 characters")
    private String name;

    @Size(min = 10,max = 250, message = "description must be at most 1000 characters")
    private String description;

    @NotNull(message = "createdAt is required")
    @PastOrPresent(message = "createdAt must be in the past or present")
    private LocalDate createdAt;

    @NotNull(message = "updatedAt is required")
    @PastOrPresent(message = "updatedAt must be in the past or present")
    private LocalDate updatedAt;

    @PrePersist
    void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDate.now();
        }
        this.updatedAt = LocalDate.now();
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDate.now();
    }
}
