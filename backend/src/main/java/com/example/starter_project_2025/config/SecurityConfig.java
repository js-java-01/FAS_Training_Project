package com.example.starter_project_2025.config;

import com.example.starter_project_2025.security.JwtAuthenticationFilter;
import com.example.starter_project_2025.security.UserDetailsServiceImpl;
import com.example.starter_project_2025.system.auth.service.oauth2.CustomOAuth2UserServiceImpl;
import com.example.starter_project_2025.system.auth.service.oauth2.OAuth2AuthenticationSuccessHandler;
import io.swagger.v3.oas.models.OpenAPI;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig
{
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserServiceImpl customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final PasswordEncoderConfig passwordEncoder;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, OpenAPI customOpenAPI) throws Exception
    {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/index.html", "/login", "/oauth2/**").permitAll()
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/assessments/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        
                        // Menu endpoints
                        .requestMatchers(HttpMethod.GET, "/api/menus/**", "/api/menu-items/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/menus/**", "/api/menu-items/**").hasAuthority("MENU_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/menus/**", "/api/menu-items/**").hasAuthority("MENU_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/menus/**", "/api/menu-items/**").hasAuthority("MENU_DELETE")
                        
                        // User and Role endpoints
                        .requestMatchers("/api/users/**").hasAnyAuthority("USER_READ", "USER_CREATE", "USER_UPDATE", "USER_DELETE")
                        .requestMatchers("/api/roles/**").hasAnyAuthority("ROLE_READ", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE")
                        .requestMatchers("/api/permissions/**").hasAnyAuthority("ROLE_READ", "ROLE_CREATE")
                        
                        // Programming Language endpoints - specific paths first
                        .requestMatchers(HttpMethod.GET, "/api/programming-languages/search").hasAuthority("PROGRAMMING_LANGUAGE_READ")
                        .requestMatchers(HttpMethod.GET, "/api/programming-languages/export").hasAuthority("PROGRAMMING_LANGUAGE_READ")
                        .requestMatchers(HttpMethod.GET, "/api/programming-languages/import/template").hasAuthority("PROGRAMMING_LANGUAGE_CREATE")
                        .requestMatchers(HttpMethod.POST, "/api/programming-languages/import").hasAuthority("PROGRAMMING_LANGUAGE_CREATE")
                        .requestMatchers(HttpMethod.POST, "/api/programming-languages").hasAuthority("PROGRAMMING_LANGUAGE_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/programming-languages/**").hasAuthority("PROGRAMMING_LANGUAGE_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/programming-languages/**").hasAuthority("PROGRAMMING_LANGUAGE_DELETE")
                        .requestMatchers(HttpMethod.GET, "/api/programming-languages/**").hasAuthority("PROGRAMMING_LANGUAGE_READ")
                        .requestMatchers("/api/locations/**").hasAnyAuthority("ROLE_READ", "ROLE_CREATE")
                        .requestMatchers("/api/departments/**").hasAnyAuthority("DEPARTMENT_READ", "DEPARTMENT_CREATE", "DEPARTMENT_UPDATE", "DEPARTMENT_DELETE")

                        .requestMatchers(HttpMethod.GET, "/api/courses/**").hasAuthority("COURSE_READ")
                        .requestMatchers(HttpMethod.POST, "/api/courses").hasAuthority("COURSE_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAuthority("COURSE_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAuthority("COURSE_DELETE")

                        .requestMatchers(HttpMethod.GET, "/api/sessions/**").hasAuthority("SESSION_READ")
                        .requestMatchers(HttpMethod.POST, "/api/sessions").hasAuthority("SESSION_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/sessions/**").hasAuthority("SESSION_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/**").hasAuthority("SESSION_DELETE")

                        
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/api/**")
                        )
                )
                .authenticationProvider(authenticationProvider(passwordEncoder.passwordEncoder()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder)
    {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception
    {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource()
    {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://localhost"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
