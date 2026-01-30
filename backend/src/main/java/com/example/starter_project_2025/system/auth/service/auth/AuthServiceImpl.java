package com.example.starter_project_2025.system.auth.service.auth;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.example.starter_project_2025.mapper.UserMapper;
import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.service.email.EmailService;
import com.example.starter_project_2025.system.auth.service.otp.OtpService;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final OtpService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public String registerUser(RegisterCreateDTO registerCreateDTO) {

        boolean exists = userRepository.existsByEmail(registerCreateDTO.getEmail());
        if (exists) {
            throw new IllegalArgumentException("Email already in use");
        }
        String otp = otpService.generatedOtpAndSave(registerCreateDTO.getEmail(), registerCreateDTO);
        Context context = new Context();
        context.setVariable("otp", otp);
        context.setVariable("name",
                Optional.ofNullable(registerCreateDTO.getFirstName() + " " + registerCreateDTO.getLastName())
                        .orElse("User"));
        String body = templateEngine.process("otp-email", context);
        try {
            emailService.sendEmail(registerCreateDTO.getEmail(), "Your OTP Code", body);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
        return otp;
    }

    @Override
    public boolean verifyEmail(String email, String code) {
        RegisterCreateDTO registerCreateDTO = otpService.verifyAndGetRegistrationData(email, code);
        if (registerCreateDTO == null) {
            return false;
        }

        User user = userMapper.toEntity(registerCreateDTO);
        Role role = roleRepository.findByName("STUDENT").isPresent()
                ? roleRepository.findByName("STUDENT").get()
                : roleRepository.findByName("USER").orElseThrow(() -> new IllegalArgumentException("Role not found"));
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode(registerCreateDTO.getPassword()));
        userRepository.save(user);
        return true;
    }

}
