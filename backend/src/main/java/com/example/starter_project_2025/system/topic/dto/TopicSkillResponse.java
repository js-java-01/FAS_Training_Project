package com.example.starter_project_2025.system.topic.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

// skill tap
@Getter
@Setter
public class TopicSkillResponse {
    private UUID topicSkillId;
    private UUID skillId;
    private String skillName;
    private String code;
    private String groupName;
    private String description;
    private boolean required;
}