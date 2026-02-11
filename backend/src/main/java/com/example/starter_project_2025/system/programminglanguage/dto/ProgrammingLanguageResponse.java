package com.example.starter_project_2025.system.programminglanguage.dto;

public class ProgrammingLanguageResponse {
    private Long id;
    private String name;
    private String version;
    private String description;
    private boolean isSupported;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isSupported() {
        return isSupported;
    }

    public void setSupported(boolean isSupported) {
        this.isSupported = isSupported;
    }
}
