package com.example.starter_project_2025.system.skill.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

// add panel
@Getter
@Setter
public class SkillResponse {
    private UUID id;
    private String name;
    private String code;
    private String groupName;
    private String description;
}
