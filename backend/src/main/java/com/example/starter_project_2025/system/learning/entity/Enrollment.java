package com.example.starter_project_2025.system.learning.entity;

import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "enrollments", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "cohort_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "cohort_id", nullable = false)
    private UUID cohortId;

    private Instant enrolledAt;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;
}
