package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.*;
import com.example.starter_project_2025.system.topic.entity.TopicObjective;
import com.example.starter_project_2025.system.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TopicObjectiveMapper {

    public TopicObjective toEntity(TopicObjectiveCreateRequest req) {
        return TopicObjective.builder()
                .code(req.getCode())
                .name(req.getName())
                .details(req.getDetails())
                .build();
    }

    public TopicObjectiveResponse toResponse(TopicObjective entity) {
        return TopicObjectiveResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .details(entity.getDetails())
                .topicId(entity.getTopic().getId())

                .createdBy(entity.getCreator() != null ? entity.getCreator().getId() : null)
                .createdByName(getDisplayName(entity.getCreator()))
                .createdDate(entity.getCreatedDate())

                .updatedBy(entity.getUpdater() != null ? entity.getUpdater().getId() : null)
                .updatedByName(getDisplayName(entity.getUpdater()))
                .updatedDate(entity.getUpdatedDate())
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