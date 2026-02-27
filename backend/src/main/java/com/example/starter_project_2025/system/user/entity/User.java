package com.example.starter_project_2025.system.user.entity;

import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.mapping.user.RoleNamesExtractor;
import com.example.starter_project_2025.system.dataio.core.template.annotation.ImportEntity;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportDefault;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportHash;
import com.example.starter_project_2025.system.dataio.mapping.user.RoleLookupResolver;
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
@ImportEntity("user")
@ExportEntity(fileName = "users", sheetName = "Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false)
    @ImportField(name = "Email", required = true)
    @ExportField(name = "Email")
    String email;

    @Column(nullable = false)
    @ImportHash
    @ImportField(name = "Password", required = true)
    String passwordHash;

    @Column(nullable = false, length = 100)
    @ImportField(name = "First Name", required = true)
    @ExportField(name = "First Name")
    String firstName;

    @Column(length = 100)
    String lastName;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @ImportField(name = "Roles",  required = true, resolver = RoleLookupResolver.class)
    @ExportField(name = "Roles", extractor = RoleNamesExtractor.class)
    Set<UserRole> userRoles;

    @OneToMany(mappedBy = "trainer")
    @JsonManagedReference
    Set<CourseClass> courseClasses;

    @OneToMany(mappedBy = "trainer")
    @JsonManagedReference
    Set<TrainerCourse> trainerCourses;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference
    Set<Submission> submissions;

    @Column(nullable = false)
    @ImportDefault("true")
    @ExportField(name = "Is Active")
    Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
