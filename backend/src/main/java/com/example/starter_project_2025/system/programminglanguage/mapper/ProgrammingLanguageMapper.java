package com.example.starter_project_2025.system.programminglanguage.mapper;

import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageCreateRequest;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageResponse;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageUpdateRequest;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProgrammingLanguageMapper {

    // Entity → Response (GET)
    ProgrammingLanguageResponse toResponse(ProgrammingLanguage entity);

    // Create → Entity (POST)
    @Mapping(target = "supported", defaultValue = "false")
    ProgrammingLanguage toEntity(ProgrammingLanguageCreateRequest request);

    // Update → Entity (PUT, partial update)
    void updateEntityFromRequest(
            ProgrammingLanguageUpdateRequest request,
            @MappingTarget ProgrammingLanguage entity
    );
}
