package com.example.starter_project_2025.system.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String entityType;

    @Column(nullable = false)
    private UUID entityId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false)
    private UUID performedBy;

    @Column(length = 100)
    private String performedByEmail;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    @Column(length = 500)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime performedAt;

    @Column(length = 50)
    private String ipAddress;
}
