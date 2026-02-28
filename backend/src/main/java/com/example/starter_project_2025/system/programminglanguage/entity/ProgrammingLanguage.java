package com.example.starter_project_2025.system.programminglanguage.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.example.starter_project_2025.system.course_programing_language.entity.CourseProgrammingLanguage;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.core.template.annotation.ImportEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@ExportEntity
@ImportEntity("programming-language")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "programming_languages", uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
})
public class ProgrammingLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, length = 255, unique = true)
    @ImportField(name = "Name", required = true)
    @ExportField(name = "Name")
    String name;

    @ImportField(name = "Version", required = true)
    @ExportField(name = "Version")
    @Column(length = 255)
    String version;

    @ImportField(name = "Description")
    @ExportField(name = "Description")
    @Column(length = 1000)
    String description;

    @ImportField(name = "Supported")
    @ExportField(name = "Supported")
    @Column(nullable = false)
    boolean isSupported;

    @OneToMany(mappedBy = "programmingLanguage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonManagedReference
    Set<CourseProgrammingLanguage> courseProgrammingLanguages;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
