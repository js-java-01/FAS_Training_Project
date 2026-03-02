package com.example.starter_project_2025.system.user.entity;

import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.auth.entity.Role;
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
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
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

    public void addRole(Role role) {
        if (userRoles == null) userRoles = new HashSet<>();

        boolean exists = userRoles.stream()
                .anyMatch(ur -> ur.getRole().getId().equals(role.getId()));

        if (!exists) {
            UserRole ur = new UserRole();
            ur.setUser(this);
            ur.setRole(role);
            userRoles.add(ur);
        }
    }

    public void replaceRoles(Set<Role> newRoles) {
        userRoles.clear();
        newRoles.forEach(this::addRole);
    }
}
