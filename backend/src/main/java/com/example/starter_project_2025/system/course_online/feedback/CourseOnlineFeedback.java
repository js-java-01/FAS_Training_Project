package com.example.starter_project_2025.system.course_online.feedback;

import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "course_online_feedbacks") 
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseOnlineFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    // LIÊN KẾT VỚI KHÓA HỌC ONLINE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_online_id", nullable = false)
    CourseOnline courseOnline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    User student;

    @Column(nullable = false)
    Integer rating;

    @Column(length = 1000)
    String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    FeedbackStatus status = FeedbackStatus.APPROVED;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}