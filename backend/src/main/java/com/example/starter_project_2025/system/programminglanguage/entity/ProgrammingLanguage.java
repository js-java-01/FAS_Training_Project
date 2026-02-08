package com.example.starter_project_2025.system.programminglanguage.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "programming_languages",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "name")
            }
        )
public class ProgrammingLanguage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255,unique = true)
    private String name;

    @Column(length = 255)
    private String version;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Boolean isSupported = false;

    public ProgrammingLanguage(){}

    public ProgrammingLanguage(String name, String version, String description, Boolean isSupported) {
        this.name = name;
        this.version = version;
        this.description = description;
        this.isSupported = false;
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

    public Boolean getSupported() {
        return isSupported;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSupported(Boolean supported) {
        isSupported = supported;
    }

    public void updateDetails(String name, String version, String description, Boolean supported) {
        this.name = name;
        this.version = version;
        this.description = description;
        this.isSupported = supported;
    }
    }
