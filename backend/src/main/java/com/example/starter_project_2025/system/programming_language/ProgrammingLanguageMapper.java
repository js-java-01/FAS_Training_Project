package com.example.starter_project_2025.system.programming_language;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProgrammingLanguageMapper extends BaseCrudMapper<ProgrammingLanguage, ProgrammingLanguageDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "courseProgrammingLanguages", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProgrammingLanguage toEntity(ProgrammingLanguageDTO dto);

    @Override
    @Mapping(source = "supported", target = "supported")
    ProgrammingLanguageDTO toResponse(ProgrammingLanguage entity);

    @Override
    @Mapping(target = "courseProgrammingLanguages", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget ProgrammingLanguage entity, ProgrammingLanguageDTO dto);
}