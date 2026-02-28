package com.example.starter_project_2025.system.classes.dto.response;

import com.example.starter_project_2025.system.course.enums.CourseLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Data
@Setter
@Getter
public class CourseDetailsResponse
{
    private UUID id;
    private String courseName;
    private String courseCode;
    private CourseLevel level;
    private String note;
    private String description;
    private Double minGpaToPass;
    private Double minAttendancePercent;
    private Boolean allowFinalRetake;
    private UUID semesterID;
    private String semesterName;
}
