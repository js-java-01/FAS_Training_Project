package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.mapper.ClassMapper;
import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicDetailResponse;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.UpdateTopicRequest;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.mapper.TopicMapper;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic.spec.TopicSpecification;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightResponse;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.mapper.TopicAssessmentTypeWeightMapper;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository.TopicAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.mapper.TrainingProgramMapper;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService
{

    private final TopicRepository topicRepository;
    private final TopicMapper mapper;
    private final UserService userService;
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;
    private final TrainingProgramRepository trainingProgramRepository;
    private final TopicAssessmentTypeWeightRepository topicAssessmentTypeWeightRepository;
    private final TopicAssessmentTypeWeightMapper weightMapper;
    private final ClassMapper classMapper;
    private final TrainingProgramMapper programMapper;

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
    public List<TopicResponse> getByIds(List<UUID> ids)
    {
        return topicRepository.findAllById(ids).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<TopicResponse> getAll(String keyword, String level, String status, Pageable pageable)
    {

        TopicStatus statusEnum = null;
        if (status != null && !status.isBlank())
        {
            statusEnum = TopicStatus.valueOf(status.toUpperCase());
        }

        Specification<Topic> spec = TopicSpecification.hasFilters(keyword, statusEnum);

        return topicRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    public void delete(UUID id)
    {
        topicRepository.deleteById(id);
    }

    @Override
    public Page<TopicDetailResponse> getMyTopics(UUID userId, String keyword, Pageable pageable)
    {
        Page<Object[]> rawResults = topicRepository.findMyTopics(userId, keyword, pageable);

        return rawResults.map(result -> {
            Topic topic = (Topic) result[0];
            TrainingClass trainingClass = (TrainingClass) result[1];
            TrainingProgram trainingProgram = (TrainingProgram) result[2];

            List<TopicAssessmentTypeWeightResponse> weights = topicAssessmentTypeWeightRepository
                    .findByTopicId(topic.getId())
                    .stream()
                    .map(weightMapper::toResponse)
                    .collect(Collectors.toList());

            return TopicDetailResponse.builder()
                    .topic(mapper.toResponse(topic))
                    .assessmentTypeWeights(weights)
                    .trainingClassReponse(classMapper.toTrainingClassResponse(trainingClass))
                    .trainingProgram(programMapper.toResponse(trainingProgram))
                    .build();
        });
    }
}