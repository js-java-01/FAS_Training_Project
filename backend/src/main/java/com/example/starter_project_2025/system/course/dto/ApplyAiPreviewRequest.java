package com.example.starter_project_2025.system.course.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApplyAiPreviewRequest {
    private List<AiPreviewLessonResponse> lessons;
}