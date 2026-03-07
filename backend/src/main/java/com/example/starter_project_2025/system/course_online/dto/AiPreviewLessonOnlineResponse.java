package com.example.starter_project_2025.system.course_online.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AiPreviewLessonOnlineResponse {
    private String name;
    private String description;
    private List<AiPreviewSessionOnlineResponse> sessions;
}
