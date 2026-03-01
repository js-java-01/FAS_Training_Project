package com.example.starter_project_2025.system.classes.mapper;

<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/classes/mapper/TrainingClassMapper.java
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
=======
import com.example.starter_project_2025.system.classes.dto.response.ClassResponse;
>>>>>>> 7c81ff20d2666c5039534aa5560eaa2e8f46f871:backend/src/main/java/com/example/starter_project_2025/system/classes/mapper/ClassMapper.java
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.semester.entity.Semester;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class ClassMapper {

<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/classes/mapper/TrainingClassMapper.java
        public TrainingClassResponse toResponse(TrainingClass entity) {
                List<String> trainers = entity.getCourseClasses() != null
                                ? entity.getCourseClasses().stream()
                                                .map(cc -> cc.getTrainer().getFirstName() + " "
                                                                + cc.getTrainer().getLastName())
                                                .toList()
                                : List.of();

                return TrainingClassResponse.builder()
                                .id(entity.getId())
                                .className(entity.getClassName())
                                .classCode(entity.getClassCode())
                                .isActive(entity.getIsActive())

                                .creatorName(entity.getCreator() != null
                                                ? entity.getCreator().getFirstName() + " "
                                                                + entity.getCreator().getLastName()
                                                : null)

                                .approverName(entity.getApprover() != null
                                                ? entity.getApprover().getFirstName() + " "
                                                                + entity.getApprover().getLastName()
                                                : null)

                                .semesterName(entity.getSemester() != null
                                                ? entity.getSemester().getName()
                                                : null)

                                .startDate(entity.getStartDate())
                                .endDate(entity.getEndDate())
                                .trainerNames(trainers)
                                .build();
        }

        public List<TrainingClassSemesterResponse> toSemesterResponse(List<TrainingClass> classes) {
                if (classes == null || classes.isEmpty()) {
                        return List.of();
                }
=======
    public ClassResponse toResponse(TrainingClass entity) {

        return ClassResponse.builder()
                .id(entity.getId())
                .className(entity.getClassName())
                .classCode(entity.getClassCode())
                .isActive(entity.getIsActive())
                .status(entity.getClassStatus() != null ? entity.getClassStatus().name() : null)
                .creatorName(entity.getCreator() != null
                        ? entity.getCreator().getFirstName() + " " + entity.getCreator().getLastName()
                        : null)
>>>>>>> 7c81ff20d2666c5039534aa5560eaa2e8f46f871:backend/src/main/java/com/example/starter_project_2025/system/classes/mapper/ClassMapper.java

                return classes.stream()
                                .collect(Collectors.groupingBy(
                                                TrainingClass::getSemester,
                                                LinkedHashMap::new,
                                                Collectors.toList()))
                                .entrySet().stream()
                                .map(entry -> {
                                        Semester semester = entry.getKey();
                                        List<TrainingClass> classList = entry.getValue();

                                        List<TrainingClassResponse> classResponses = classList.stream()
                                                        .map(this::toResponse)
                                                        .collect(Collectors.toList());

                                        return new TrainingClassSemesterResponse(semester.getId(), semester.getName(),
                                                        classResponses);
                                })
                                .toList();

        }
}