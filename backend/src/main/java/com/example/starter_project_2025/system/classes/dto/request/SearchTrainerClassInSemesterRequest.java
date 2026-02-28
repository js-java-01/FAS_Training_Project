package com.example.starter_project_2025.system.classes.dto.request;

import com.example.starter_project_2025.system.classes.entity.ClassStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Data
@Getter
@Setter
public class SearchTrainerClassInSemesterRequest
{
    private String keyword;
    private Boolean isActive;
    private ClassStatus classStatus;
    private UUID semesterId;
}
