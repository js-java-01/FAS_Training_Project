package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.controller;

import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightCreateRequest;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightResponse;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.service.TopicAssessmentTypeWeightService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topic-accessment-weights")
@RequiredArgsConstructor
@Tag(name = "Topic Management", description = "Topic management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TopicAssessmentTypeWeightController
{
    private final TopicAssessmentTypeWeightService service;

    @GetMapping("/{topicId}")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public List<TopicAssessmentTypeWeightResponse> getWeightsByTopicId(@RequestParam UUID topicId)
    {
        return service.getWeightsByTopicId(topicId);
    }

    @PutMapping("/{topicId}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public List<TopicAssessmentTypeWeightResponse> update(@RequestParam UUID topicId, @RequestBody List<TopicAssessmentTypeWeightCreateRequest> request)
    {
        return service.createAndUpdateWeightsByTopicId(topicId, request);
    }

    @PostMapping("/{topicId}")
    @PreAuthorize("hasAuthority('TOPIC_CREATE')")
    public List<TopicAssessmentTypeWeightResponse> create(@RequestParam UUID topicId, @RequestBody List<TopicAssessmentTypeWeightCreateRequest> request)
    {
        return service.createAndUpdateWeightsByTopicId(topicId, request);
    }
}
