package com.example.starter_project_2025.system.classes.mapper;

import com.example.starter_project_2025.system.classes.dto.response.ClassResponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassReponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.semester.entity.Semester;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClassMapper
{

    public ClassResponse toResponse(TrainingClass entity)
    {
        List<String> trainers = entity.getCourseClasses() != null
                ? entity.getCourseClasses().stream()
                .filter(cc -> cc.getTrainer() != null)
                .map(cc -> cc.getTrainer().getFirstName() + " "
                        + cc.getTrainer().getLastName())
                .toList()
                : List.of();

        return ClassResponse.builder()
                .id(entity.getId())
                .className(entity.getClassName())
                .classCode(entity.getClassCode())
                .isActive(entity.getIsActive())
                .status(entity.getClassStatus() != null ? entity.getClassStatus().name() : null)

                .creatorName(entity.getCreator() != null
                        ? entity.getCreator().getFirstName() + " " + entity.getCreator().getLastName()
                        : null)

                .approverName(entity.getApprover() != null
                        ? entity.getApprover().getFirstName() + " " + entity.getApprover().getLastName()
                        : null)

                .semesterName(entity.getSemester() != null
                        ? entity.getSemester().getName()
                        : null)

                .trainingProgramId(entity.getTrainingProgram() != null
                        ? entity.getTrainingProgram().getId()
                        : null)

                .trainingProgramName(entity.getTrainingProgram() != null
                        ? entity.getTrainingProgram().getName()
                        : null)

                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())

                .trainerNames(trainers)
                .build();
    }

    public List<TrainingClassSemesterResponse> toSemesterResponse(List<TrainingClass> classes)
    {
        if (classes == null || classes.isEmpty())
        {
            return List.of();
        }

        return classes.stream()
                .collect(Collectors.groupingBy(
                        TrainingClass::getSemester,
                        LinkedHashMap::new,
                        Collectors.toList()))
                .entrySet().stream()
                .map(entry -> {
                    Semester semester = entry.getKey();
                    List<TrainingClass> classList = entry.getValue();

                    List<ClassResponse> classResponses = classList.stream()
                            .map(this::toResponse)
                            .collect(Collectors.toList());

                    return new TrainingClassSemesterResponse(semester.getId(), semester.getName(),
                            classResponses);
                })
                .toList();

    }

    public TrainingClassReponse toTrainingClassResponse(TrainingClass entity)
    {
        List<String> trainers = entity.getCourseClasses() != null
                ? entity.getCourseClasses().stream()
                .filter(cc -> cc.getTrainer() != null)
                .map(cc -> cc.getTrainer().getFirstName() + " "
                        + cc.getTrainer().getLastName())
                .toList()
                : List.of();

        return TrainingClassReponse.builder()
                .id(entity.getId())
                .className(entity.getClassName())
                .classCode(entity.getClassCode())
                .isActive(entity.getIsActive())
                .status(entity.getClassStatus() != null ? entity.getClassStatus().name() : null)

                .creatorName(entity.getCreator() != null
                        ? entity.getCreator().getFirstName() + " " + entity.getCreator().getLastName()
                        : null)

                .approverName(entity.getApprover() != null
                        ? entity.getApprover().getFirstName() + " " + entity.getApprover().getLastName()
                        : null)

                .semesterName(entity.getSemester() != null
                        ? entity.getSemester().getName()
                        : null)

                .trainingProgramId(entity.getTrainingProgram() != null
                        ? entity.getTrainingProgram().getId()
                        : null)

                .trainingProgramName(entity.getTrainingProgram() != null
                        ? entity.getTrainingProgram().getName()
                        : null)

                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())

                .trainerNames(trainers)
                .build();
    }
}