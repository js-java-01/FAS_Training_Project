package com.example.starter_project_2025.system.assessment.mapper;

import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagResponse;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TagMapper {

     TagResponse toResponse(Tag tag);
}
