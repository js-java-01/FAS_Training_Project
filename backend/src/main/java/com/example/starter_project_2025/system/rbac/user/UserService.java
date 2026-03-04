package com.example.starter_project_2025.system.rbac.user;

import com.example.starter_project_2025.base.crud.CrudService;

import java.util.UUID;

public interface UserService extends CrudService<UUID, UserDTO, UserFilter> {

    User getCurrentUser();
}
