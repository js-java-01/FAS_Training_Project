package com.example.starter_project_2025.system.auth.service.auth;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.example.starter_project_2025.mapper.UserMapper;
import com.example.starter_project_2025.system.auth.dto.forgotpassword.ForgotPasswordDTO;
import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.service.email.EmailService;
import com.example.starter_project_2025.system.auth.service.otp.OtpService;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.dto.login.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import com.example.starter_project_2025.system.auth.service.refreshToken.RefreshTokenService;
import com.example.starter_project_2025.system.user.service.UserService;
import com.example.starter_project_2025.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final UserService userServiceImpl;

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

    @Override
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));
        String otp = otpService.generatedOtpAndSave(email, email);
        Context context = new Context();
        context.setVariable("otpCode", otp);
        String body = templateEngine.process("forgot-password-email", context);
        try {
            emailService.sendEmail(email, "Password Reset OTP", body);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
        return otp;
    }

    @Override
    public boolean verifyForgotPasswordOtpAndSavePassword(ForgotPasswordDTO forgotPasswordDTO) {
        String email = forgotPasswordDTO.getEmail();
        String otp = forgotPasswordDTO.getOtp();
        String newPassword = forgotPasswordDTO.getNewPassword();
        String savedEmail = otpService.verifyAndGetRegistrationData(email, otp);
        if (savedEmail == null || !savedEmail.equals(email)) {
            throw new IllegalArgumentException("Invalid OTP or email");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    @Override
    public LoginResponse login(LoginRequest reqData, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(reqData.getEmail(), reqData.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String at = jwtUtils.generateToken(authentication);

        if (reqData.isRememberedMe()) {
            var user = userServiceImpl.findByEmail(userDetails.getEmail());
            var rt = refreshTokenService.generateAndSaveRefreshToken(user);
            ResponseCookie cookie = ResponseCookie.from("refresh_token", rt)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        return new LoginResponse(at, userDetails.getEmail(), userDetails.getFirstName(), userDetails.getLastName(),
                userDetails.getRole(), userDetails.getPermissions());
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
            refreshTokenService.revokeAllByUser(userDetails.getId());

            clearLogoutCookie(response);

            SecurityContextHolder.clearContext();
        } else if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            clearLogoutCookie(response);
        }
    }

    private void clearLogoutCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
