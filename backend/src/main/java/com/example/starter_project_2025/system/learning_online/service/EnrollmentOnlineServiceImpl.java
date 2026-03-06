package com.example.starter_project_2025.system.learning_online.service;

import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.mapper.CourseOnlineMapper;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.learning_online.dto.EnrolledCourseOnlineResponse;
import com.example.starter_project_2025.system.learning_online.dto.EnrollmentOnlineRequest;
import com.example.starter_project_2025.system.learning_online.dto.EnrollmentOnlineResponse;
import com.example.starter_project_2025.system.learning_online.entity.EnrollmentOnline;
import com.example.starter_project_2025.system.learning_online.enums.EnrollmentStatusOnline;
import com.example.starter_project_2025.system.learning_online.repository.EnrollmentOnlineRepository;

import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentOnlineServiceImpl implements EnrollmentOnlineService {

        private final EnrollmentOnlineRepository enrollmentOnlineRepository;
        private final CourseOnlineRepository courseOnlineRepository;
        private final CourseOnlineMapper courseOnlineMapper;
        private final UserRepository userRepository;

        @Override
        @Transactional
        public EnrollmentOnlineResponse enroll(EnrollmentOnlineRequest request) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                CourseOnline course = courseOnlineRepository.findById(request.courseId())
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Course not found"));

                if (enrollmentOnlineRepository.existsByUserIdAndCourseOnlineId(user.getId(), course.getId())) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "You are already enrolled in this course");
                }

                EnrollmentOnline enrollment = EnrollmentOnline.builder()
                                .user(user)
                                .courseOnline(course)
                                .status(EnrollmentStatusOnline.ACTIVE)
                                .build();

                enrollmentOnlineRepository.save(enrollment);

                return new EnrollmentOnlineResponse(
                                enrollment.getId(),
                                course.getId(),
                                enrollment.getEnrolledAt(),
                                enrollment.getStatus());
        }

        @Override
        @Transactional(readOnly = true)
        public List<EnrolledCourseOnlineResponse> getMyEnrolledCourses() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                return enrollmentOnlineRepository.findByUserId(user.getId()).stream()
                                .filter(e -> e.getCourseOnline() != null)
                                .map(e -> EnrolledCourseOnlineResponse.builder()
                                                .courseId(e.getCourseOnline().getId())
                                                .course(courseOnlineMapper.toResponse(e.getCourseOnline()))
                                                .build())
                                .collect(Collectors.toList());
        }
}