package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.user.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TopicMapper {

    public Topic toEntity(TopicCreateRequest req) {
        if (req == null) return null;

        return Topic.builder()
                .topicCode(req.getTopicCode())
                .topicName(req.getTopicName())
                .level(req.getLevel())
                .description(req.getDescription())
                .build();
    }

    public TopicResponse toResponse(Topic t) {
        return TopicResponse.builder()
                .id(t.getId())
                .topicName(t.getTopicName())
                .topicCode(t.getTopicCode())
                .level(t.getLevel())
                .status(t.getStatus())
                .version(t.getVersion())
                .description(t.getDescription())

                .createdBy(t.getCreator() != null ? t.getCreator().getId() : null)
                .createdByName(getDisplayName(t.getCreator()))
                .createdDate(t.getCreatedDate())

                .updatedBy(t.getUpdater() != null ? t.getUpdater().getId() : null)
                .updatedByName(getDisplayName(t.getUpdater()))
                .updatedDate(t.getUpdatedDate())

                .build();
    }

    private String getDisplayName(User user) {
        if (user == null) return null;
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        }
        return user.getEmail();
    }
}