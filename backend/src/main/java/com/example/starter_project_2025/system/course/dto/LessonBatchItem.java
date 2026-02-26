package com.example.starter_project_2025.system.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class LessonBatchItem {

    @NotBlank
    private String lessonName;

    private String description;

    private Integer order;

    private Integer duration;

    private List<SessionBatchItem> sessions;
}
