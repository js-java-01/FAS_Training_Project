package com.example.starter_project_2025.system.rbac.permission;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper extends BaseCrudMapper<Permission, PermissionDTO> {
}
