package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.exception.BusinessValidationException;
import com.example.starter_project_2025.system.common.error.ErrorUtil;
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
import java.util.*;

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
    public Page<UserResponse> getAll(
            Pageable pageable,
            String search,
            List<UUID> roleIds,
            LocalDateTime createFrom,
            LocalDateTime createTo,
            Boolean isActive
    ) {
        Specification<User> spec = Specification
                .where(UserSpecification.hasKeyword(search))
                .and(UserSpecification.hasRoleIds(roleIds))
                .and(UserSpecification.createdAfter(createFrom))
                .and(UserSpecification.createdBefore(createTo))
                .and(UserSpecification.isActive(isActive));

        return userRepository.findAll(spec, pageable)
                .map(userMapper::toResponse);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_READ')")
    public UserResponse getById(UUID id) {
        return userMapper.toResponse(findUserOrThrow(id));
    }

    @Override
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public UserResponse create(UserCreateRequest request) {

        Map<String, List<String>> errors = new HashMap<>();

        validateEmailUnique(request.email(), null, errors);
        validateRoles(request.roleIds(), errors);

        ErrorUtil.throwIfHasErrors(errors);

        User user = userMapper.toEntity(request);

        user.setPasswordHash(passwordEncoder.encode(request.password()));

        Set<Role> roles = getRoles(request.roleIds());
        roles.forEach(user::addRole);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public UserResponse update(UUID id, UserUpdateRequest request) {
        User user = findUserOrThrow(id);

        Map<String, List<String>> errors = new HashMap<>();

        if (request.email() != null) {
            validateEmailUnique(request.email(), user.getId(), errors);
        }

        if (request.roleIds() != null) {
            validateRoles(request.roleIds(), errors);
        }

        ErrorUtil.throwIfHasErrors(errors);

        if (request.password() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        if (request.roleIds() != null) {
            user.replaceRoles(getRoles(request.roleIds()));
        }

        userMapper.update(user, request);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public void delete(UUID id) {
        userRepository.delete(findUserOrThrow(id));
    }

    @Override
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No authenticated user");
        }

        String email;

        Object principal = auth.getPrincipal();

        if (principal instanceof UserDetailsImpl userDetails) {
            email = userDetails.getEmail();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(ErrorMessage.USER_NOT_FOUND));
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", "id", id));
    }

    private void validateEmailUnique(String email, UUID currentUserId,
                                     Map<String, List<String>> errors) {

        Optional<User> existing = userRepository.findByEmail(email);

        if (existing.isPresent() &&
                (currentUserId == null || !existing.get().getId().equals(currentUserId))) {

            ErrorUtil.addError(errors, "email", "Email is already in use");
        }
    }

    private void validateRoles(List<UUID> roleIds,
                               Map<String, List<String>> errors) {

        if (roleIds == null || roleIds.isEmpty()) {
            ErrorUtil.addError(errors, "roleIds", "At least one role must be assigned");
            return;
        }

        long found = roleRepository.countByIdIn(roleIds);

        if (found != roleIds.size()) {
            ErrorUtil.addError(errors, "roleIds", "One or more roles are invalid");
        }
    }

    private Set<Role> getRoles(List<UUID> roleIds) {
        return new HashSet<>(roleRepository.findAllById(roleIds));
    }
}
