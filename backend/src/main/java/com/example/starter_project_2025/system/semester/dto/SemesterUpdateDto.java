package com.example.starter_project_2025.system.semester.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Getter
@Setter
public class SemesterUpdateDto
{
    private UUID id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<UUID> classIds;
}
