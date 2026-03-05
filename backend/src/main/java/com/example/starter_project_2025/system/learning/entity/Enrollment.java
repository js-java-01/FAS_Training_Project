package com.example.starter_project_2025.system.learning.entity;

<<<<<<< HEAD
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
=======
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2
import com.example.starter_project_2025.system.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
<<<<<<< HEAD
    @JoinColumn(name = "class_id", nullable = false)
    private TrainingClass trainingClass;
=======
    @JoinColumn(name = "course_id", nullable = false)
    private CourseOnline course;
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

    @CreationTimestamp
    private LocalDateTime enrollmentDate;

}