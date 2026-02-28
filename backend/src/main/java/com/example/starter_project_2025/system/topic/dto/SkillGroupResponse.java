package com.example.starter_project_2025.system.topic.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SkillGroupResponse {
    private UUID id;
    private String name;
    private String code;
    private int skillCount;
}
