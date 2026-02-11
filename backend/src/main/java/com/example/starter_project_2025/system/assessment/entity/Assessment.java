package com.example.starter_project_2025.system.assessment.entity;

import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_type_id", nullable = false)
    @JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
    private AssessmentType assessmentType;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({ "assessment" })
    private List<AssessmentQuestion> assessmentQuestions = new ArrayList<>();

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer totalScore;

    private Integer passScore;

    private Integer timeLimitMinutes;

    private Integer attemptLimit;

    private Boolean isShuffleQuestion = false;

    private Boolean isShuffleOption = false;

    @Enumerated(EnumType.STRING)
    private AssessmentStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
