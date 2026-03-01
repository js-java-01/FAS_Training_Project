package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponse;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")

public interface QuestionMapper {
    @Mapping(target = "category", source = "category")
    @Mapping(target = "options", source = "options")
    @Mapping(target = "tags", source = "tags")
    QuestionResponse toResponse(Question question);

    QuestionResponse.CategoryDTO toCategoryDTO(
            com.example.starter_project_2025.system.assessment.entity.QuestionCategory category
    );

    QuestionResponse.OptionDTO toOptionDTO(QuestionOption option);

    QuestionResponse.TagDTO toTagDTO(Tag tag);

    List<QuestionResponse.OptionDTO> toOptionDTOList(List<QuestionOption> options);

    List<QuestionResponse.TagDTO> toTagDTOList(java.util.Set<Tag> tags);
}
