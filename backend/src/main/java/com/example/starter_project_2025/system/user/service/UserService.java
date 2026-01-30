package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.UUID;

public interface UserService
{
    @PreAuthorize("hasAuthority('USER_READ')")
    Page<UserDTO> getAllUsers(Pageable pageable);

    @PreAuthorize("hasAuthority('USER_READ')")
    UserDTO getUserById(UUID id);

    @PreAuthorize("hasAuthority('USER_CREATE')")
    UserDTO createUser(CreateUserRequest request);

    @PreAuthorize("hasAuthority('USER_UPDATE')")
    UserDTO updateUser(UUID id, UserDTO userDTO);

    @PreAuthorize("hasAuthority('USER_DELETE')")
    void deleteUser(UUID id);

    @PreAuthorize("hasAuthority('USER_ACTIVATE')")
    UserDTO toggleUserStatus(UUID id);

    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    UserDTO assignRole(UUID userId, UUID roleId);

    UserDTO convertToDTO(User user);

    User findByEmail(String email);
}
