package com.example.starter_project_2025.system.topic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "topic_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private TopicLesson lesson;

    @Column(nullable = false)
    private String deliveryType;

    private String trainingFormat;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private Integer sessionOrder;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String note;

    @ManyToMany
    @JoinTable(
            name = "topic_session_objectives",
            joinColumns = @JoinColumn(name = "topic_session_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_objective_id")
    )
    @Builder.Default
    private Set<TopicObjective> learningObjectives = new LinkedHashSet<>();
}
