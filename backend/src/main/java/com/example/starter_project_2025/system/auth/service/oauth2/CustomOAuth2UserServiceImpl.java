package com.example.starter_project_2025.system.auth.service.oauth2;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserServiceImpl extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        var oAuth2User = super.loadUser(userRequest);
        var attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");

        var user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    var newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFirstName((String) attributes.get("given_name"));
                    newUser.setLastName((String) attributes.get("family_name"));

                    var defaultRole = roleRepository.findByName("STUDENT")
                            .orElseThrow(() -> new RuntimeException(ErrorMessage.ROLE_NOT_FOUND));
                    // newUser.setRole(defaultRole);

                    String randomPass = UUID.randomUUID().toString();
                    newUser.setPasswordHash(passwordEncoder.encode(randomPass));

                    return userRepository.save(newUser);
                });

        return oAuth2User;
    }
}
