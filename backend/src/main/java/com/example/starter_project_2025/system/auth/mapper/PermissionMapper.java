package com.example.starter_project_2025.system.auth.mapper;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionDTO;
import com.example.starter_project_2025.system.auth.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper extends BaseCrudMapper<Permission, PermissionDTO> {
}
