package com.example.starter_project_2025.system.assessment.assessment;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment.assessment_question.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.assessment.submission.Submission;
import org.mapstruct.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AssessmentMapper extends BaseCrudMapper<Assessment, AssessmentDTO> {

    @Override
    @Mapping(target = "assessmentTypeId", source = "assessmentType.id")
    @Mapping(target = "questionIds", expression = "java(mapQuestionIds(entity.getAssessmentQuestions()))")
    @Mapping(target = "submissionCount", expression = "java(mapSubmissionCount(entity.getSubmissions()))")
    AssessmentDTO toResponse(Assessment entity);

    @Override
    @Mapping(target = "assessmentType", source = "assessmentTypeId", qualifiedByName = "mapAssessmentType")
    @Mapping(target = "assessmentQuestions", ignore = true)
    @Mapping(target = "submissions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Assessment toEntity(AssessmentDTO dto);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "assessmentType", source = "assessmentTypeId", qualifiedByName = "mapAssessmentType")
    @Mapping(target = "assessmentQuestions", ignore = true)
    @Mapping(target = "submissions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(@MappingTarget Assessment entity, AssessmentDTO dto);

    // ================= CUSTOM MAPPERS =================

    @Named("mapAssessmentType")
    default AssessmentType mapAssessmentType(UUID id) {
        if (id == null) return null;

        AssessmentType type = new AssessmentType();
        type.setId(id);
        return type;
    }

    default List<UUID> mapQuestionIds(List<AssessmentQuestion> questions) {
        if (questions == null) return List.of();
        return questions.stream()
                .map(AssessmentQuestion::getId)
                .collect(Collectors.toList());
    }

    default Integer mapSubmissionCount(List<Submission> submissions) {
        return submissions == null ? 0 : submissions.size();
    }
}
