package com.example.starter_project_2025.system.learning.service;

import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.entity.CourseCohort;
import com.example.starter_project_2025.system.course.enums.CohortStatus;
import com.example.starter_project_2025.system.course.mapper.CourseMapper;
import com.example.starter_project_2025.system.course.repository.CourseCohortRepository;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.dto.EnrollmentResponse;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.learning.mapper.EnrollmentMapper;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseCohortRepository cohortRepository;
    private final UserRepository userRepository;
    private final EnrollmentMapper mapper;
    private final CourseMapper courseMapper;

    @Override
    public EnrollmentResponse enroll(EnrollmentRequest request) {

        UUID userId = getCurrentUserId();

        CourseCohort cohort = cohortRepository.findById(request.cohortId())
                .orElseThrow(() -> new RuntimeException("Cohort not found"));

        // already enrolled
        if (enrollmentRepository.existsByUserIdAndCohortId(userId, cohort.getId())) {
            throw new RuntimeException("You already enrolled in this cohort");
        }

        // not OPEN
        if (cohort.getStatus() != CohortStatus.OPEN) {
            throw new RuntimeException("Cohort is not open for enrollment");
        }

        // full capacity
        long enrolled = enrollmentRepository.countByCohortId(cohort.getId());
        if (enrolled >= cohort.getCapacity()) {
            throw new RuntimeException("Cohort is full");
        }

        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .cohortId(cohort.getId())
                .enrolledAt(Instant.now())
                .status(EnrollmentStatus.ACTIVE)
                .build();

        enrollmentRepository.save(enrollment);

        return mapper.toResponse(enrollment);
    }

    @Override
    public List<CourseResponse> getMyEnrolledCourses() {
        UUID userId = getCurrentUserId();
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);

        return enrollments.stream()
                .map(enrollment -> cohortRepository.findById(enrollment.getCohortId()).orElse(null))
                .filter(cohort -> cohort != null && cohort.getCourse() != null)
                .map(cohort -> courseMapper.toResponse(cohort.getCourse()))
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    private UUID getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow();
        return user.getId();
    }
}
