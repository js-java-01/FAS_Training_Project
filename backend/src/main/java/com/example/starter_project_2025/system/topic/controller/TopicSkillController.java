package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.skill.dto.SkillResponse;
import com.example.starter_project_2025.system.topic.dto.TopicSkillResponse;
import com.example.starter_project_2025.system.topic.dto.UpdateTopicSkillRequest;
import com.example.starter_project_2025.system.topic.service.TopicSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/skills")
@RequiredArgsConstructor
public class TopicSkillController {

    private final TopicSkillService service;

    @GetMapping
    public List<TopicSkillResponse> getTopicSkills(@PathVariable UUID topicId) {
        return service.getTopicSkills(topicId);
    }

    @GetMapping("/available")
    public List<SkillResponse> getAvailableSkills(
            @PathVariable UUID topicId,
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) String keyword
    ) {
        return service.getAvailableSkills(topicId, groupId, keyword);
    }

    @PutMapping
    public void updateTopicSkills(
            @PathVariable UUID topicId,
            @RequestBody UpdateTopicSkillRequest request
    ) {
        service.updateTopicSkills(topicId, request);
    }
}
