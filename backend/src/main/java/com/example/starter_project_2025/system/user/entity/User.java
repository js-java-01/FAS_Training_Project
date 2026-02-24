package com.example.starter_project_2025.system.user.entity;

import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.user_role.entity.UserRole;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false, length = 255)
    String email;

    @Column(nullable = false)
    String passwordHash;

    @Column(nullable = false, length = 100)
    String firstName;

    @Column(nullable = false, length = 100)
    String lastName;

    @OneToMany(mappedBy = "user")
    List<UserRole> userRoles;

    @Column(nullable = false)
    Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
