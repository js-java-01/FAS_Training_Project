package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponseDTO;
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
    QuestionResponseDTO toResponse(Question question);

    QuestionResponseDTO.CategoryDTO toCategoryDTO(
            com.example.starter_project_2025.system.assessment.entity.QuestionCategory category
    );

    QuestionResponseDTO.OptionDTO toOptionDTO(QuestionOption option);

    QuestionResponseDTO.TagDTO toTagDTO(Tag tag);

    List<QuestionResponseDTO.OptionDTO> toOptionDTOList(List<QuestionOption> options);

    List<QuestionResponseDTO.TagDTO> toTagDTOList(java.util.Set<Tag> tags);
}
