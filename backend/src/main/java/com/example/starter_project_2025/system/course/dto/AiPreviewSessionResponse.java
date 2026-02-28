package com.example.starter_project_2025.system.course.dto;

import com.example.starter_project_2025.system.course.enums.SessionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiPreviewSessionResponse {
    private Integer order;
    private SessionType type;
    private String topic;
    private String studentTask;
    private Integer duration;
}
