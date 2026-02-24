package com.example.starter_project_2025.system.assessment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "assessment_questions")
public class AssessmentQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Nối về Assessment (Của người khác làm, ông đã có file Assessment dummy rồi)
    @ManyToOne
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    // Nối về Question (Của ông)
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "score")
    private Double score;

    @Column(name = "order_index")
    private Integer orderIndex;
}