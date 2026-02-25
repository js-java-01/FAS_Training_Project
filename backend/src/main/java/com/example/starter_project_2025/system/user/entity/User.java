package com.example.starter_project_2025.system.user.entity;

import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.dataio.importer.components.ImportColumn;
import com.example.starter_project_2025.system.dataio.importer.components.ImportDefault;
import com.example.starter_project_2025.system.dataio.importer.resolver.RoleLookupResolver;
import com.example.starter_project_2025.system.trainer_course.entity.TrainerCourse;
import com.example.starter_project_2025.system.user_role.entity.UserRole;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User
{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false, length = 255)
    @ImportColumn(header = "Email", required = true)
    String email;

    @Column(nullable = false)
    @ImportDefault("password123")
    String passwordHash;

    @Column(nullable = false, length = 100)
    @ImportColumn(header = "FirstName", required = true)
    String firstName;

    @Column(length = 100)
    String lastName;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @ImportColumn(header = "Role",  required = true, resolver = RoleLookupResolver.class)
    Set<UserRole> userRoles;

    @OneToMany(mappedBy = "trainer")
    @JsonManagedReference
    Set<CourseClass> courseClasses;

    @OneToMany(mappedBy = "trainer")
    @JsonManagedReference
    Set<TrainerCourse> trainerCourses;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference
    private Set<Submission> submissions;

    @Column(nullable = false)
    @ImportDefault("true")
    Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
