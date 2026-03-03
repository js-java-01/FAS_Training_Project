package com.example.starter_project_2025.system.course_online.dto;

import com.example.starter_project_2025.system.course_online.enums.SessionType;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SessionBatchItem {

    private SessionType type;

    private String topic;

    private String studentTasks;

    private Integer sessionOrder;

    private List<UUID> objectiveIds;

    private UUID assessmentId;
}
