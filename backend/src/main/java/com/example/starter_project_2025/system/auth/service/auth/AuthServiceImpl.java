package com.example.starter_project_2025.system.auth.service.auth;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.auth.service.email.EmailService;
import com.example.starter_project_2025.system.auth.service.otp.OtpService;

import com.example.starter_project_2025.system.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final OtpService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;

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

}
