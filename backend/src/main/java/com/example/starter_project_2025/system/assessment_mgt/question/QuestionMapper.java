<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question/QuestionMapper.java
package com.example.starter_project_2025.system.assessment.question;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment.question_tag.QuestionTag;
========
package com.example.starter_project_2025.system.assessment_mgt.question;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.system.assessment_mgt.question_tag.QuestionTag;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question/QuestionMapper.java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

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
}
