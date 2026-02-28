package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.SkillResponse;
import com.example.starter_project_2025.system.topic.dto.TopicSkillResponse;
import com.example.starter_project_2025.system.topic.dto.UpdateTopicSkillRequest;
import com.example.starter_project_2025.system.topic.entity.Skill;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicSkill;
import com.example.starter_project_2025.system.topic.mapper.TopicSkillMapper;
import com.example.starter_project_2025.system.topic.repository.SkillRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic.repository.TopicSkillRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicSkillServiceImpl implements TopicSkillService {

    private final TopicSkillRepository topicSkillRepository;
    private final TopicRepository topicRepository;
    private final SkillRepository skillRepository;
    private final TopicSkillMapper mapper;

    @Override
    public List<TopicSkillResponse> getTopicSkills(UUID topicId) {
        return topicSkillRepository.findByTopicId(topicId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public List<SkillResponse> getAvailableSkills(UUID topicId, UUID groupId, String keyword) {
        return topicSkillRepository
                .findAvailableSkills(topicId, groupId, keyword)
                .stream()
                .map(mapper::toSkillResponse)
                .toList();
    }

    @Override
    public void updateTopicSkills(UUID topicId, UpdateTopicSkillRequest request) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow();

        topicSkillRepository.deleteByTopicId(topicId);

        List<TopicSkill> newMappings = request.getSkills().stream().map(item -> {

            Skill skill = skillRepository.findById(item.getSkillId())
                    .orElseThrow();

            TopicSkill ts = new TopicSkill();
            ts.setTopic(topic);
            ts.setSkill(skill);
            ts.setRequired(item.isRequired());

            return ts;

        }).toList();

        topicSkillRepository.saveAll(newMappings);
    }
}