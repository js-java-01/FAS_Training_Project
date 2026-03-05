package com.example.starter_project_2025.system.course_online.dto;

import com.example.starter_project_2025.system.course_online.enums.SessionTypeOnline;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiPreviewSessionOnlineResponse {
    private Integer order;
    private SessionTypeOnline type;
    private String topic;
    private String studentTask;
    private Integer duration;
}
