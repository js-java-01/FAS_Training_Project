package com.example.starter_project_2025.system.auth.service.auth;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.dto.forgotpassword.ForgotPasswordDTO;
import com.example.starter_project_2025.system.auth.dto.login.LoginRequest;
import com.example.starter_project_2025.system.auth.dto.login.LoginResponse;
import com.example.starter_project_2025.system.auth.dto.permission.GetPermissonReqDTO;
import com.example.starter_project_2025.system.auth.dto.register.RegisterCreateDTO;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.mapper.AuthMapper;
import com.example.starter_project_2025.system.auth.mapper.UserAuthMapper;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.auth.service.email.EmailService;
import com.example.starter_project_2025.system.auth.service.otp.OtpService;
import com.example.starter_project_2025.system.auth.service.refreshToken.RefreshTokenService;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import com.example.starter_project_2025.util.CookieUtil;
import com.example.starter_project_2025.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService
{
    private final OtpService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;
    private final UserAuthMapper userAuthMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;
    private final AuthMapper authMapper;
    private final CookieUtil cookieUtil;
    private final UserRoleRepository userRoleRepository;

    @Override
    public String registerUser(RegisterCreateDTO registerCreateDTO)
    {

        boolean exists = userRepository.existsByEmail(registerCreateDTO.getEmail());
        if (exists)
        {
            throw new IllegalArgumentException("Email already in use");
        }
        String otp = otpService.generatedOtpAndSave(registerCreateDTO.getEmail(), registerCreateDTO);
        Context context = new Context();
        context.setVariable("otp", otp);
        context.setVariable("name",
                Optional.ofNullable(registerCreateDTO.getFirstName() + " " + registerCreateDTO.getLastName())
                        .orElse("User"));
        String body = templateEngine.process("otp-email", context);
        try
        {
            emailService.sendEmail(registerCreateDTO.getEmail(), "Your OTP Code", body);
        } catch (Exception e)
        {
            throw new RuntimeException("Failed to send OTP email", e);
        }
        return "Success";
    }

    @Override
    public boolean verifyEmail(String email, String code)
    {
        RegisterCreateDTO registerCreateDTO = otpService.verifyAndGetRegistrationData(email, code,
                RegisterCreateDTO.class);
        if (registerCreateDTO == null)
        {
            return false;
        }

        User user = userAuthMapper.toEntity(registerCreateDTO);
        Role role = roleRepository.findByName("STUDENT").isPresent()
                ? roleRepository.findByName("STUDENT").get()
                : roleRepository.findByName("USER").orElseThrow(() -> new IllegalArgumentException("Role not found"));
        // user.setRole(role);
        user.setIsActive(true);
        user.setPasswordHash(passwordEncoder.encode(registerCreateDTO.getPassword()));
        user.setIsActive(true);
        userRepository.save(user);
        return true;
    }

    @Override
    public String forgotPassword(String email)
    {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));
        String otp = otpService.generatedOtpAndSave(email, email);
        Context context = new Context();
        context.setVariable("otpCode", otp);
        context.setVariable("email", email);
        String body = templateEngine.process("forgotPassword", context);
        try
        {
            emailService.sendEmail(email, "Password Reset OTP", body);
        } catch (Exception e)
        {
            throw new RuntimeException("Failed to send password reset email", e);
        }
        return "Success";
    }

    @Override
    public boolean verifyForgotPasswordOtpAndSavePassword(ForgotPasswordDTO forgotPasswordDTO)
    {
        String email = forgotPasswordDTO.getEmail();
        String token = forgotPasswordDTO.getToken();
        String newPassword = forgotPasswordDTO.getNewPassword();
        String savedEmail = otpService.verifyAndGetRegistrationData(email, token, String.class);
        if (savedEmail == null || !savedEmail.equals(email))
        {
            throw new IllegalArgumentException("Invalid OTP or email");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    @Override
    public LoginResponse login(LoginRequest reqData, HttpServletResponse response)
    {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(reqData.getEmail(), reqData.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        var user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException(ErrorMessage.USER_NOT_FOUND));

        var defaultRole = userRoleRepository.findByUserAndIsDefault(user, true)
                .orElseThrow(() -> new RuntimeException(ErrorMessage.ROLE_NOT_FOUND))
                .getRole();

        userDetails.setRole(defaultRole.getName());

        var permissions = getPermissionFromRole(defaultRole);
        userDetails.setPermissions(permissions);

        String at = jwtUtils.generateToken(authentication);

        if (reqData.isRememberedMe())
        {
            var rt = refreshTokenService.generateAndSaveRefreshToken(user, Optional.empty());
            cookieUtil.addCookie(response, rt);
        }

        var res = authMapper.toLoginResponse(userDetails);
        res.setToken(at);
        return res;
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response)
    {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails)
        {
            refreshTokenService.revokeAllByUser(userDetails.getId());
            SecurityContextHolder.clearContext();
        }
        cookieUtil.clearLogoutCookie(response);
    }

    @Override
    public LoginResponse refresh(String token, HttpServletResponse response)
    {
        refreshTokenService.verifyRefreshToken(token);
        if (jwtUtils.validateToken(token))
        {
            String email = jwtUtils.getEmailFromToken(token);
            var roleName = jwtUtils.getUserDetailsFromToken(token).getRole();

            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException(ErrorMessage.USER_NOT_FOUND));
            var userDetails = UserDetailsImpl.build(user);

//            var defaultRole = userRoleRepository.findByUserAndIsDefault(user, true)
//                    .orElseThrow(() -> new RuntimeException(ErrorMessage.ROLE_NOT_FOUND))
//                    .getRole();

            var role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException(ErrorMessage.ROLE_NOT_FOUND));

            userDetails.setRole(roleName);
            var permissions = getPermissionFromRole(role);
            userDetails.setPermissions(permissions);

            String newToken = jwtUtils.generateToken(userDetails);

            refreshTokenService.revokeAllByUser(user.getId());
            String newRt = refreshTokenService.generateAndSaveRefreshToken(user, Optional.of(role));
            cookieUtil.addCookie(response, newRt);

            var res = authMapper.toLoginResponse(userDetails);
            res.setToken(newToken);
            return res;
        } else
        {
            throw new RuntimeException(ErrorMessage.REFRESH_TOKEN_HAS_EXPIRED);
        }
    }


    @Override
    public LoginResponse switchRole(GetPermissonReqDTO data, String email, HttpServletResponse response)
    {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(ErrorMessage.USER_NOT_FOUND));

        var role = roleRepository.findByName(data.roleName)
                .orElseThrow(() -> new RuntimeException(ErrorMessage.ROLE_NOT_FOUND));

        var userRoles = userRoleRepository.findByUserAndRole(user, role);
        if (userRoles == null || userRoles.isEmpty())
        {
            throw new RuntimeException(ErrorMessage.USER_DOES_NOT_HAVE_THE_SPECIFIED_ROLE);
        }

        var permissions = getPermissionFromRole(role);

        var userDetails = UserDetailsImpl.build(user);
        userDetails.setRole(role.getName());
        userDetails.setPermissions(permissions);

        String newAt = jwtUtils.generateToken(userDetails);
        refreshTokenService.revokeAllByUser(user.getId());
        String newRt = refreshTokenService.generateAndSaveRefreshToken(user, Optional.of(role));
        cookieUtil.addCookie(response, newRt);

        var res = authMapper.toLoginResponse(userDetails);
        res.setToken(newAt);
        return res;
    }

    private Set<String> getPermissionFromRole(Role role)
    {
        return role.getPermissions().stream().map(p -> p.getName()).collect(Collectors.toSet());
    }
}
