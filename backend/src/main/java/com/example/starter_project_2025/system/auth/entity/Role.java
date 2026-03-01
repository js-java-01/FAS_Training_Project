package com.example.starter_project_2025.system.auth.entity;

import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportDefault;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.core.template.annotation.ImportEntity;
import com.example.starter_project_2025.system.dataio.mapping.role.PermissionLookupResolver;
import com.example.starter_project_2025.system.dataio.mapping.role.PermissionNamesExtractor;
import com.example.starter_project_2025.system.user.entity.UserRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
@FieldDefaults(level = AccessLevel.PRIVATE)
@ImportEntity("role")
@ExportEntity(fileName = "roles", sheetName = "Roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false, length = 50)
    @ImportField(name = "Name", required = true)
    @ExportField(name = "Name")
    String name;

    @Column(length = 500)
    @ImportField(name = "Description")
    @ExportField(name = "Description")
    String description;

    @Column(nullable = false)
    @ImportDefault("true")
    @ExportField(name = "Is Active")
    Boolean isActive = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_permissions",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @ImportField(name = "Permissions", required = true, resolver = PermissionLookupResolver.class)
    @ExportField(name = "Permissions", extractor = PermissionNamesExtractor.class)
    Set<Permission> permissions = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
