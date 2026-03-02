package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment.dto.category.QuestionCategoryDTO;
import com.example.starter_project_2025.system.assessment.dto.question.QuestionDTO;
import com.example.starter_project_2025.system.assessment.dto.question.response.QuestionResponseDTO;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.QuestionCategory;
import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.entity.QuestionTag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")

public interface QuestionMapper extends BaseCrudMapper<Question, QuestionDTO> {

    @Override
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "tagIds",
            expression = "java(mapTagIds(entity.getTags()))")
    QuestionDTO toResponse(Question entity);

    default java.util.Set<Long> mapTagIds(java.util.Set<QuestionTag> tags) {
        if (tags == null) return null;
        return tags.stream()
                .map(QuestionTag::getId)
                .collect(java.util.stream.Collectors.toSet());
    }

    @Override
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "options", ignore = true)
    Question toEntity(QuestionDTO dto);

    @Override
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "options", ignore = true)
    void update(@MappingTarget Question entity, QuestionDTO dto);

//    @Mapping(target = "category", source = "category")
//    @Mapping(target = "options", source = "options")
//    @Mapping(target = "tags", source = "tags")
//    QuestionResponseDTO toResponse(Question question);
//
//    QuestionResponseDTO.CategoryDTO toCategoryDTO(
//            com.example.starter_project_2025.system.assessment.entity.QuestionCategory category
//    );
//
//    QuestionResponseDTO.OptionDTO toOptionDTO(QuestionOption option);
//
//    QuestionResponseDTO.TagDTO toTagDTO(QuestionTag tag);
//
//    List<QuestionResponseDTO.OptionDTO> toOptionDTOList(List<QuestionOption> options);
//
//    List<QuestionResponseDTO.TagDTO> toTagDTOList(java.util.Set<QuestionTag> tags);
}
