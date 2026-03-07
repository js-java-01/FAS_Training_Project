package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicTimeAllocationDTO;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicTimeAllocation;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentComponentRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic.repository.TopicTimeAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicTimeAllocationServiceImpl implements TopicTimeAllocationService {

    private final TopicRepository topicRepository;
    private final TopicTimeAllocationRepository allocationRepository;
    private final TopicAssessmentComponentRepository componentRepository;

    @Override
    public TopicTimeAllocationDTO get(UUID topicId) {
        TopicTimeAllocation entity = allocationRepository.findByTopicId(topicId)
                .orElse(new TopicTimeAllocation());
        return toDTO(topicId, entity);
    }

    @Override
    public TopicTimeAllocationDTO save(UUID topicId, TopicTimeAllocationDTO dto) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        TopicTimeAllocation entity = allocationRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    TopicTimeAllocation a = new TopicTimeAllocation();
                    a.setTopic(topic);
                    return a;
                });

        entity.setTrainingHours(dto.getTrainingHours());
        entity.setPracticeHours(dto.getPracticeHours());
        entity.setSelfStudyHours(dto.getSelfStudyHours());
        entity.setCoachingHours(dto.getCoachingHours());
        entity.setNotes(dto.getNotes());

        allocationRepository.save(entity);
        return toDTO(topicId, entity);
    }

    // ─── helpers ───────────────────────────────────────────────────────────────

    private TopicTimeAllocationDTO toDTO(UUID topicId, TopicTimeAllocation entity) {
        TopicTimeAllocationDTO dto = new TopicTimeAllocationDTO();
        dto.setTrainingHours(entity.getTrainingHours());
        dto.setPracticeHours(entity.getPracticeHours());
        dto.setSelfStudyHours(entity.getSelfStudyHours());
        dto.setCoachingHours(entity.getCoachingHours());
        dto.setNotes(entity.getNotes());

        // Compute assessment hours from components (count × duration in minutes →
        // hours)
        double assessmentMinutes = componentRepository
                .findByScheme_TopicIdOrderByDisplayOrder(topicId)
                .stream()
                .filter(c -> c.getDuration() != null)
                .mapToDouble(c -> (double) c.getCount() * c.getDuration())
                .sum();
        double assessmentHours = assessmentMinutes / 60.0;
        dto.setAssessmentHours(Math.round(assessmentHours * 100.0) / 100.0);

        double total = safeVal(entity.getTrainingHours())
                + safeVal(entity.getPracticeHours())
                + safeVal(entity.getSelfStudyHours())
                + safeVal(entity.getCoachingHours())
                + assessmentHours;
        dto.setTotalHours(Math.round(total * 100.0) / 100.0);

        return dto;
    }

    private double safeVal(Double v) {
        return v == null ? 0.0 : v;
    }
}
