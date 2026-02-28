package com.example.starter_project_2025.system.programminglanguage.entity;

import java.util.List;
import java.util.Set;

import com.example.starter_project_2025.system.course_programing_language.entity.CourseProgrammingLanguage;
import com.example.starter_project_2025.system.program_courses.entity.ProgramCourse;
import com.example.starter_project_2025.system.trainer_programminglanguae.entity.TrainerProgrammingLanguage;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
@Table(name = "programming_languages", uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
})
public class ProgrammingLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255, unique = true)
    private String name;

    @Column(length = 255)
    private String version;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Boolean isSupported;

    @OneToMany(mappedBy = "programmingLanguage")
    @JsonManagedReference
    private Set<CourseProgrammingLanguage> courseProgrammingLanguages;

    @OneToMany(mappedBy = "programmingLanguage")
    @JsonManagedReference
    private Set<TrainerProgrammingLanguage> trainerProgrammingLanguages;
    @OneToMany(mappedBy = "programmingLanguage")
    @JsonManagedReference
    private Set<ProgramCourse> programCourses;

    public ProgrammingLanguage() {
    }

    public ProgrammingLanguage(String name, String version, String description, Boolean isSupported) {
        this.name = name;
        this.version = version;
        this.description = description;
        this.isSupported = isSupported;
    }

    public ProgrammingLanguage(String name, String version, String description) {
        this.name = name;
        this.version = version;
        this.description = description;
        this.isSupported = false; // Set default value
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getVersion() {
        return version;
    }

    public String getDescription() {
        return description;
    }

    public Boolean isSupported() {
        return isSupported;
    }

    public void updateDetails(String name, String version, String description) {
        this.name = name;
        this.version = version;
        this.description = description;
    }

    void setSupported(Boolean supported) {
        this.isSupported = supported;
    }
}
