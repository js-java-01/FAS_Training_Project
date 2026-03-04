package com.example.starter_project_2025.system.topic.entity;

import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.user.entity.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String topicName;

    @Column(nullable = false, unique = true)
    private String topicCode;

    @Enumerated(EnumType.STRING)
    private TopicLevel level; // Beginner, Intermediate, Advanced

    private String version; // v1.0, v1.1...

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TopicStatus status; // DRAFT, ACTIVE, REJECTED...

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "topic")
    @JsonManagedReference
    private Set<TrainingProgramTopic> trainingProgramTopics;


    @OneToMany(mappedBy = "topic")
    @JsonManagedReference
    private Set<Course> courses;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne
    @JoinColumn(name = "updater_id")
    private User updater;

    @PrePersist
    public void prePersist()
    {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        if (this.version == null)
        {
            this.version = "v1.0";
        }
    }

    @PreUpdate
    public void preUpdate()
    {
        this.updatedDate = LocalDateTime.now();
    }
}