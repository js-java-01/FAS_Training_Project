package com.example.starter_project_2025.system.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "role_hierarchy")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class    RoleHierarchy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_role_id", nullable = false)
    private Role parentRole;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "child_role_id", nullable = false)
    private Role childRole;

    @Column(nullable = false)
    private Integer hierarchyLevel = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
