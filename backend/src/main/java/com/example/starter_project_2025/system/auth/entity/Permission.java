package com.example.starter_project_2025.system.auth.entity;

import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportDefault;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.core.template.annotation.ImportEntity;
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
@Table(name = "permissions")
@FieldDefaults(level = AccessLevel.PRIVATE)
@ImportEntity("permission")
@ExportEntity(fileName = "permissions", sheetName = "Permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false, length = 100)
    @ImportField(name = "Name", required = true)
    @ExportField(name = "Name")
    String name;

    @Column
    @ImportField(name = "Description")
    @ExportField(name = "Description")
    String description;

    @Column(nullable = false, length = 50)
    @ImportField(name = "Resource", required = true)
    @ExportField(name = "Resource")
    String resource;

    @Column(nullable = false, length = 50)
    @ImportField(name = "Action", required = true)
    @ExportField(name = "Action")
    String action;

    @Builder.Default
    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    Set<Role> roles = new HashSet<>();

    @ImportDefault("true")
    @ExportField(name = "Is Active")
    Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
