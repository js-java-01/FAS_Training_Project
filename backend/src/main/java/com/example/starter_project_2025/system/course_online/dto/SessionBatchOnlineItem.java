package com.example.starter_project_2025.system.course_online.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.SessionTypeOnline;

@Data
public class SessionBatchOnlineItem {

    private SessionTypeOnline type;

    private String topic;

    private String studentTasks;

    private Integer sessionOrder;

    private List<UUID> objectiveIds;

    private UUID assessmentId;
}
