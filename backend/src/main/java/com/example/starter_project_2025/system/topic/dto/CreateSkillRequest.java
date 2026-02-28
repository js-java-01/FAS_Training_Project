package com.example.starter_project_2025.system.topic.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateSkillRequest {

    private String code;
    private String name;
    private String description;
    private UUID groupId;
}
