package com.example.starter_project_2025.system.training_program.service;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.training_program.dto.request.CreateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.UpdateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.mapper.TrainingProgramMapper;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;


import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingProgramServiceImpl implements TrainingProgramService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final TrainingProgramMapper mapper;
    private final TopicRepository topicRepository;

    @Override
    public Page<TrainingProgramResponse> searchTrainingPrograms(
            String keyword,
            Pageable pageable) {

        Specification<TrainingProgram> spec = (root, query, cb) -> {

            if (keyword != null && !keyword.isEmpty()) {
                return cb.like(
                        cb.lower(root.get("name")),
                        "%" + keyword.toLowerCase() + "%");
            }

            return cb.conjunction();
        };

        return trainingProgramRepository.findAll(spec, pageable)
                .map(mapper::toResponse);
    }

    @Transactional
    public TrainingProgramResponse create(CreateTrainingProgramRequest request) {

        if (trainingProgramRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Training Program name already exists");
        }

        TrainingProgram program = new TrainingProgram();
        program.setName(request.getName().trim());
        program.setVersion(request.getVersion().trim());
        program.setDescription(request.getDescription());

        TrainingProgram savedProgram = trainingProgramRepository.saveAndFlush(program);

        Set<Topic> topics = topicRepository.findAllById(request.getTopicIds())
                .stream()
                .collect(Collectors.toSet());

        if (topics.size() != request.getTopicIds().size()) {
            throw new RuntimeException("Some topics not found");
        }

        Set<TrainingProgramTopic> relations = topics.stream()
                .map(topic -> TrainingProgramTopic.builder()
                        .trainingProgram(savedProgram)
                        .topic(topic)
                        .build())
                .collect(Collectors.toSet());

        savedProgram.setTrainingProgramTopics(relations);

        return mapper.toResponse(savedProgram);
    }

    @Override
    @Transactional(readOnly = true)
    public TrainingProgramResponse getById(UUID id) {

        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training Program not found"));

        return mapper.toResponse(program);
    }

    @Override
    @Transactional
    public void delete(UUID id) {

        if (!trainingProgramRepository.existsById(id)) {
            throw new RuntimeException("Training Program not found");
        }
        trainingProgramRepository.deleteById(id);
    }

    @Transactional
    public TrainingProgramResponse update(UUID id, UpdateTrainingProgramRequest request) {

        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training program not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            program.setName(request.getName());
        }

        if (request.getDescription() != null) {
            program.setDescription(request.getDescription());
        }

        if (request.getVersion() != null && !request.getVersion().isBlank()) {
            program.setVersion(request.getVersion());
        }

        if (request.getTopicIds() != null) {

            if (request.getTopicIds().isEmpty()) {
                throw new RuntimeException("Training program must have at least 1 topic");
            }

            Set<Topic> topics = topicRepository.findAllById(request.getTopicIds())
                    .stream()
                    .collect(Collectors.toSet());

            if (topics.size() != request.getTopicIds().size()) {
                throw new RuntimeException("Some topics not found");
            }

            Set<TrainingProgramTopic> relations = topics.stream()
                    .map(topic -> TrainingProgramTopic.builder()
                            .trainingProgram(program)
                            .topic(topic)
                            .build())
                    .collect(Collectors.toSet());

            program.setTrainingProgramTopics(relations);
        }

        return mapper.toResponse(program);
    }

}
