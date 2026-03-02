package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RoleCrudRepository;
import com.example.starter_project_2025.system.common.error.ErrorUtil;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.dto.UserFilter;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.mapper.UserMapper;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl
        extends CrudServiceImpl<User, UUID, UserDTO, UserFilter>
        implements UserService {

    UserMapper userMapper;
    UserRepository userRepository;
    RoleCrudRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    protected BaseCrudRepository<User, UUID> getRepository() {
        return userRepository;
    }

    @Override
    protected BaseCrudMapper<User, UserDTO> getMapper() {
        return userMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"email", "firstName", "lastName"};
    }

    @Override
    protected void beforeCreate(User user, UserDTO request) {

        Map<String, List<String>> errors = new HashMap<>();

        validateEmailUnique(request.getEmail(), null, errors);
        validateRoles(request.getRoleIds(), errors);

        ErrorUtil.throwIfHasErrors(errors);

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        getRoles(request.getRoleIds()).forEach(user::addRole);
    }

    @Override
    protected void beforeUpdate(User user, UserDTO request) {

        Map<String, List<String>> errors = new HashMap<>();

        if (request.getEmail() != null) {
            validateEmailUnique(request.getEmail(), user.getId(), errors);
        }

        if (request.getRoleIds() != null) {
            validateRoles(request.getRoleIds(), errors);
        }

        ErrorUtil.throwIfHasErrors(errors);

        if (request.getPassword() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoleIds() != null) {
            user.replaceRoles(getRoles(request.getRoleIds()));
        }
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

    @Override
    @PreAuthorize("hasAuthority('USER_READ')")
    public Page<UserDTO> getAll(Pageable pageable, String search, UserFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_READ')")
    public UserDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public UserDTO create(UserDTO request) {
        return super.createEntity(request);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public UserDTO update(UUID id, UserDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    private void validateEmailUnique(String email, UUID currentUserId,
                                     Map<String, List<String>> errors) {

        Optional<User> existing = userRepository.findByEmail(email);

        if (existing.isPresent() &&
                (currentUserId == null || !existing.get().getId().equals(currentUserId))) {

            ErrorUtil.addError(errors, "email", "Email is already in use");
        }
    }

    private void validateRoles(Set<UUID> roleIds,
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

    private Set<Role> getRoles(Set<UUID> roleIds) {
        return new HashSet<>(roleRepository.findAllById(roleIds));
    }
}
