package com.example.starter_project_2025.system.classes.mapper;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import org.springframework.stereotype.Component;

@Component
public class TrainingClassMapper {

    public TrainingClassResponse toResponse(TrainingClass entity) {

        return TrainingClassResponse.builder()
                .id(entity.getId())
                .className(entity.getClassName())
                .classCode(entity.getClassCode())
                .isActive(entity.getIsActive())

                .creatorName(entity.getCreator() != null
                        ? entity.getCreator().getFirstName() + " " + entity.getCreator().getLastName()
                        : null)

                .approverName(entity.getApprover() != null
                        ? entity.getApprover().getFirstName() + " " + entity.getApprover().getLastName()
                        : null)

                .semesterName(entity.getSemester() != null
                        ? entity.getSemester().getName()
                        : null)

                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())

                .build();
    }
}