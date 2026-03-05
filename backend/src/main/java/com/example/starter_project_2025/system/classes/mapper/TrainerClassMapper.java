package com.example.starter_project_2025.system.classes.mapper;

import com.example.starter_project_2025.system.classes.dto.response.TrainerClassResponse;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TrainerClassMapper
{
    public TrainerClassResponse toTrainerClassResponse(TrainingClass trainingClass)
    {
        if (trainingClass == null)
        {
            return null;
        }
        TrainerClassResponse response = new TrainerClassResponse();
        response.setId(trainingClass.getId());
        response.setClassName(trainingClass.getClassName());
        response.setClassCode(trainingClass.getClassCode());
        response.setIsActive(trainingClass.getIsActive());
        response.setCreatorName(trainingClass.getCreator() != null
                ? trainingClass.getCreator().getFirstName() + " " + trainingClass.getCreator().getLastName()
                : null);
        response.setApproverName(trainingClass.getApprover() != null
                ? trainingClass.getApprover().getFirstName() + " " + trainingClass.getApprover().getLastName()
                : null);
        response.setSemesterName(trainingClass.getSemester() != null ? trainingClass.getSemester().getName() : null);
        response.setStartDate(trainingClass.getStartDate());
        response.setEndDate(trainingClass.getEndDate());

        response.setNumberOfTrainees(trainingClass.getEnrollments() != null ? trainingClass.getEnrollments().size() : 0);
        response.setNumberOfCourses(trainingClass.getCourseClasses() != null ? trainingClass.getCourseClasses().size() : 0);

        return response;
    }

    public List<TrainerClassResponse> toTrainerClassResponseList(List<TrainingClass> trainingClasses)
    {
        if (trainingClasses == null || trainingClasses.isEmpty())
        {
            return List.of();
        }
        return trainingClasses.stream()
                .map(this::toTrainerClassResponse)
                .toList();
    }

}
