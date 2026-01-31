package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService
{

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @PreAuthorize("hasAuthority('USER_READ')")
    @Override
    public Page<UserDTO> getAllUsers(Pageable pageable)
    {
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    @PreAuthorize("hasAuthority('USER_READ')")
    @Override
    public UserDTO getUserById(UUID id)
    {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return convertToDTO(user);
    }

    @PreAuthorize("hasAuthority('USER_CREATE')")
    @Override
    public UserDTO createUser(CreateUserRequest request)
    {
        if (userRepository.existsByEmail(request.getEmail()))
        {
            throw new BadRequestException("Email already exists: " + request.getEmail());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(role);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Override
    public UserDTO updateUser(UUID id, UserDTO userDTO)
    {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail()))
        {
            if (userRepository.existsByEmail(userDTO.getEmail()))
            {
                throw new BadRequestException("Email already exists: " + userDTO.getEmail());
            }
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getFirstName() != null)
        {
            user.setFirstName(userDTO.getFirstName());
        }

        if (userDTO.getLastName() != null)
        {
            user.setLastName(userDTO.getLastName());
        }

        if (userDTO.getRoleId() != null)
        {
            Role role = roleRepository.findById(userDTO.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", userDTO.getRoleId()));
            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @PreAuthorize("hasAuthority('USER_DELETE')")
    @Override
    public void deleteUser(UUID id)
    {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

    @PreAuthorize("hasAuthority('USER_ACTIVATE')")
    @Override
    public UserDTO toggleUserStatus(UUID id)
    {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setIsActive(!user.getIsActive());
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    @Override
    public UserDTO assignRole(UUID userId, UUID roleId)
    {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @Override
    public UserDTO convertToDTO(User user)
    {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        if (user.getRole() != null)
        {
            dto.setRoleId(user.getRole().getId());
            dto.setRoleName(user.getRole().getName());
        }

        return dto;
    }

    @Override
    public User findByEmail(String email)
    {
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException(ErrorMessage.USER_NOT_FOUND));
    }

//    public UserDetails findUserDetailsByEmail(String email)
//    {
//        var user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException(ErrorMessage.USER_NOT_FOUND));
//        return UserDetailsImpl.build(user);
//    }
}
