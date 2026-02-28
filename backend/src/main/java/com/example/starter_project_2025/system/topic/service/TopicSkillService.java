package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.SkillResponse;
import com.example.starter_project_2025.system.topic.dto.TopicSkillResponse;
import com.example.starter_project_2025.system.topic.dto.UpdateTopicSkillRequest;

import java.util.List;
import java.util.UUID;

public interface TopicSkillService {

    List<TopicSkillResponse> getTopicSkills(UUID topicId);

    List<SkillResponse> getAvailableSkills(UUID topicId, UUID groupId, String keyword);

    void updateTopicSkills(UUID topicId, UpdateTopicSkillRequest request);
}
