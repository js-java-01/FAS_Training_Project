package com.example.starter_project_2025.system.topic.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TopicAiPreviewSessionResponse {
    private Integer order;
    private String deliveryType;
    private String content;
    private String note;
    private Integer duration;
}
