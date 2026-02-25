package com.example.starter_project_2025.system.course.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import com.example.starter_project_2025.system.course.enums.SessionType;

@Entity
@Table(name = "sessions")
@Getter @Setter

public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String topic;

    @Enumerated(EnumType.STRING)
    private SessionType type; // VIDEO_LECTURE, LIVE_SESSION, QUIZ, ASSIGNMENT, PROJECT

    @Column(columnDefinition = "TEXT")
    private String studentTasks;

    @Column(nullable = false)
    private Integer sessionOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private CourseLesson lesson;
}

