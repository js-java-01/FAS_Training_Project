package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.UpdateTopicRequest;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.mapper.TopicMapper;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic.spec.TopicSpecification;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;
import com.example.starter_project_2025.system.training_program_topic.entity.repository.TrainingProgramTopicRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService
{

    private final TopicRepository topicRepository;
    private final TopicMapper mapper;
    private final UserService userService;
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;
    private final TrainingProgramRepository trainingProgramRepository;

    @Override
    @Transactional
    public TopicResponse create(TopicCreateRequest req)
    {
        if (topicRepository.existsByTopicCode(req.getTopicCode()))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic code already exists");
        }

        var checkExists = topicRepository.findByTopicName((req.getTopicName().toUpperCase()));
        if (checkExists != null)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic name already exists: " + req.getTopicName());
        }

        Topic topic = mapper.toEntity(req);
        topic.setCreator(userService.getCurrentUser());
        topic.setStatus(TopicStatus.ACTIVE);
        Topic savedTopic = topicRepository.save(topic);

        return mapper.toResponse(savedTopic);
    }

    @Override
    @Transactional
    public TopicResponse update(UUID id, UpdateTopicRequest req)
    {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        if (req.getTopicName() != null && !req.getTopicName().equals(topic.getTopicName()))
        {
            var checkNameExists = topicRepository.findByTopicName(req.getTopicName());
            if (checkNameExists.getId() != id)
            {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic's name has been used:  " + req.getTopicName());
            }
            topic.setTopicName(req.getTopicName());
        }

        if (req.getLevel() != null)
        {
            topic.setLevel(req.getLevel());
        }
        if (req.getDescription() != null)
        {
            topic.setDescription(req.getDescription());
        }
        if (req.getStatus() != null)
        {
            topic.setStatus(req.getStatus());
        }
        if (req.getVersion() != null)
        {
            topic.setVersion(req.getVersion());
        }

        topic.setUpdater(userService.getCurrentUser());
        Topic savedTopic = topicRepository.save(topic);

        return mapper.toResponse(savedTopic);
    }

    @Override
    public TopicResponse getById(UUID id)
    {
        return mapper.toResponse(topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found")));
    }

    @Override
    public Page<TopicResponse> getAll(String keyword, String level, String status, Pageable pageable)
    {
        TopicLevel levelEnum = null;
        if (level != null && !level.isBlank())
        {
            levelEnum = TopicLevel.valueOf(level.toUpperCase());
        }

        TopicStatus statusEnum = null;
        if (status != null && !status.isBlank())
        {
            statusEnum = TopicStatus.valueOf(status.toUpperCase());
        }

        Specification<Topic> spec = TopicSpecification.hasFilters(keyword, levelEnum, statusEnum);

        return topicRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    public void delete(UUID id)
    {
        topicRepository.deleteById(id);
    }
}