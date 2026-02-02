<<<<<<< HEAD
package com.example.starter_project_2025.system.user.service.impl;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.user.mapper.UserMapper;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import com.example.starter_project_2025.system.user.spec.UserSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
=======
package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
>>>>>>> G1-develop

import java.time.LocalDateTime;
import java.util.UUID;

<<<<<<< HEAD
@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {

    UserMapper userMapper;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @PreAuthorize("hasAuthority('USER_READ')")
    public Page<UserDTO> getAllUsers(
=======
public interface UserService {

    Page<UserDTO> getAllUsers(
>>>>>>> G1-develop
            String searchContent,
            UUID roleId,
            LocalDateTime createFrom,
            LocalDateTime createTo,
            Boolean isActive,
            Pageable pageable
<<<<<<< HEAD
    ) {
        Specification<User> spec = Specification
                .where(UserSpecification.hasUserKeyword(searchContent))
                .and(UserSpecification.hasRoleId(roleId))
                .and(UserSpecification.createdAfter(createFrom))
                .and(UserSpecification.createdBefore(createTo))
                .and(UserSpecification.isActive(isActive));

        return userRepository.findAll(spec, pageable).map(userMapper::toResponse);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_READ')")
    public UserDTO getUserById(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        return userMapper.toResponse(user);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public UserDTO createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists: " + request.getEmail());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setIsActive(true);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public UserDTO updateUser(UUID id, UserDTO request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));
            user.setRole(role);
        }

        userMapper.update(user, request);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public void deleteUser(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userRepository.delete(user);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_ACTIVATE')")
    public UserDTO toggleUserStatus(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setIsActive(!user.getIsActive());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    public UserDTO assignRole(UUID userId, UUID roleId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        user.setRole(role);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public User findByEmail(String email)
    {
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException(ErrorMessage.USER_NOT_FOUND));
    }

=======
    );

    UserDTO getUserById(UUID id);

    UserDTO createUser(CreateUserRequest request);

    UserDTO updateUser(UUID id, UserDTO request);

    void deleteUser(UUID id);

    UserDTO toggleUserStatus(UUID id);

    UserDTO assignRole(UUID userId, UUID roleId);

    User findByEmail(String email);
>>>>>>> G1-develop
}
