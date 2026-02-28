package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.user.mapper.UserMapper;
import com.example.starter_project_2025.system.user.repository.UserRepository;
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

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.starter_project_2025.security.UserDetailsImpl;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {

    UserMapper userMapper;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    @PreAuthorize("hasAuthority('USER_READ')")
    public Page<UserResponse> getUsersPage(
            Pageable pageable,
            String search,
            UUID roleId,
            LocalDateTime createFrom,
            LocalDateTime createTo,
            Boolean isActive
    ) {
        Specification<User> spec = Specification
                .where(UserSpecification.hasUserKeyword(search))
                .and(UserSpecification.hasRoleId(roleId))
                .and(UserSpecification.createdAfter(createFrom))
                .and(UserSpecification.createdBefore(createTo))
                .and(UserSpecification.isActive(isActive));

        return userRepository.findAll(spec, pageable).map(userMapper::toResponse);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_READ')")
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        return userMapper.toResponse(user);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already exists: " + request.email());
        }

        User user = userMapper.toEntity(request);

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setIsActive(true);

        Set<Role> roles = getRolesOrThrow(request.roleIds());
        roles.forEach(user::addRole);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new BadRequestException("Email already exists: " + request.email());
            }
            user.setEmail(request.email());
        }

        if (request.password() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        if (request.roleIds() != null) {
            Set<Role> roles = getRolesOrThrow(request.roleIds());
            user.replaceRoles(roles);
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
    public UserResponse toggleUserStatus(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setIsActive(!user.getIsActive());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    public UserResponse assignRole(UUID userId, UUID roleId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        user.addRole(role);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        String email;

        if (principal instanceof UserDetailsImpl userDetails) {
            email = userDetails.getEmail();
        } else if (principal instanceof String) {
            email = (String) principal;
        } else {
            throw new RuntimeException("Unable to resolve current user principal");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessage.USER_NOT_FOUND));
    }

    private Set<Role> getRolesOrThrow(List<UUID> roleIds) {
        Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));

        if (roles.size() != roleIds.size()) {
            throw new ResourceNotFoundException("Some roles not found");
        }

        return roles;
    }
}
