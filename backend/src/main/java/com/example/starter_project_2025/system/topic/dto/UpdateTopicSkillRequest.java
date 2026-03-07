package com.example.starter_project_2025.system.topic.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class UpdateTopicSkillRequest {
    private List<TopicSkillItem> skills;

    @Getter @Setter
    public static class TopicSkillItem {
        private UUID skillId;
        private boolean required;
    }
}