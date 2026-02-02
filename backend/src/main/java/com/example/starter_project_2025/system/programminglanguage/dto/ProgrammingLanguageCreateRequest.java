package com.example.starter_project_2025.system.programminglanguage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProgrammingLanguageCreateRequest
{
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must be at most 255 characters")
    private String name;

    @Size(max = 255, message = "Version must be at most 255 characters")
    private String version;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    private Boolean isSupported;

    public Boolean getSupported() {
        return isSupported;
    }

    public void setSupported(Boolean isSupported) {
        this.isSupported = isSupported;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getVersion() {
        return version;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
