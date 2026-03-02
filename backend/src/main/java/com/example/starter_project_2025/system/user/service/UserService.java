package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.base.service.CrudService;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.dto.UserFilter;
import com.example.starter_project_2025.system.user.entity.User;

import java.util.UUID;

public interface UserService extends CrudService<UUID, UserDTO, UserFilter> {

    User getCurrentUser();
}
