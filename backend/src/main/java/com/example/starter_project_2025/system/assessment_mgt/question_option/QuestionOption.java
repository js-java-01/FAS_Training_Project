package com.example.starter_project_2025.system.assessment_mgt.question_option;

import com.example.starter_project_2025.system.assessment_mgt.question.Question;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "question_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "is_correct", nullable = false)
    boolean correct = false;

    @Column(name = "order_index")
    Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    Question question;
}
