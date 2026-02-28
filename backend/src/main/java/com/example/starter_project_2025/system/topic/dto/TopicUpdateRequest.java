package com.example.starter_project_2025.system.topic.dto;

import lombok.Data;

@Data
public class TopicUpdateRequest {
    private String name;
    private String level;
    private String status;
    private String description;
    // Thêm version nếu bạn cho phép cập nhật version thủ công
    private String version;
}