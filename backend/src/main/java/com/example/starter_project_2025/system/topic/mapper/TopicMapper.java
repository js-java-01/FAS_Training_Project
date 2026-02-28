package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TopicMapper {

    // 3.2.17.2: CREATE REQUEST → ENTITY
    public Topic toEntity(TopicCreateRequest req) {
        if (req == null) return null;

        return Topic.builder()
                .code(req.getCode())
                .name(req.getName())
                .level(req.getLevel())
                .description(req.getDescription())
                .status("DRAFT")  // Default status theo Business Rules
                .version("v1.0") // Default version theo SRS
                .build();
    }

    // 3.2.17.1: ENTITY → RESPONSE
    public TopicResponse toResponse(Topic t) {
        if (t == null) return null;

        return TopicResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .code(t.getCode())
                .level(t.getLevel())
                .status(t.getStatus())
                .version(t.getVersion())
                .description(t.getDescription())

                // CREATOR (Lấy ID và Email làm Name giống Course)
                .createdBy(
                        t.getCreator() != null ? t.getCreator().getId() : null)
                .createdByName(
                        t.getCreator() != null ? t.getCreator().getEmail() : null)
                .createdDate(t.getCreatedDate())

                // UPDATER
                .updatedBy(
                        t.getUpdater() != null ? t.getUpdater().getId() : null)
                .updatedByName(
                        t.getUpdater() != null ? t.getUpdater().getEmail() : null)
                .updatedDate(t.getUpdatedDate())

                .build();
    }
}