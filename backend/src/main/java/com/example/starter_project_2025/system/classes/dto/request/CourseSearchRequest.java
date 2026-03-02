package com.example.starter_project_2025.system.classes.dto.request;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CourseSearchRequest
{
    private UUID semesterId;
    private String keyword;
    private CourseLevel level;
    private Double minGpa;
    private Boolean allowFinalRetake;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
}
