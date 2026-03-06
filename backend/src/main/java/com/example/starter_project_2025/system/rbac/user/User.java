package com.example.starter_project_2025.system.rbac.user;

import com.example.starter_project_2025.system.assessment_mgt.submission.Submission;
import com.example.starter_project_2025.system.rbac.role.Role;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.base.dataio.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.base.dataio.exporter.annotation.ExportField;
import com.example.starter_project_2025.base.dataio.importer.annotation.ImportDefault;
import com.example.starter_project_2025.base.dataio.importer.annotation.ImportField;
import com.example.starter_project_2025.base.dataio.importer.annotation.ImportHash;
import com.example.starter_project_2025.base.dataio.importer.annotation.PostImport;
import com.example.starter_project_2025.base.dataio.template.annotation.ImportEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

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
    @ExportField(name = "Roles", relation = true, path = "role.name")
    Set<UserRole> userRoles = new HashSet<>();

    @OneToMany(mappedBy = "trainer")
    @JsonManagedReference
    Set<CourseClass> courseClasses;

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

    @Transient
    @ImportField(
            name = "Roles",
            lookupEntity = Role.class,
            lookupField = "name"
    )
    Set<Role> importedRoles;

    @PostImport
    public void buildRelations() {
        if (importedRoles != null) {
            replaceRoles(importedRoles);
        }
    }

    public String getFullName() {
        return firstName + (lastName != null ? " " + lastName : "");
    }
}
