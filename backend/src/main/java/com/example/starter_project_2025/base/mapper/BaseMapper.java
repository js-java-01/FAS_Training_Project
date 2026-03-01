package com.example.starter_project_2025.base.mapper;

import org.mapstruct.MappingTarget;

public interface BaseMapper<E, R, C, U> {

    R toResponse(E entity);

    E toEntity(C request);

    void update(@MappingTarget E entity, U request);
}
