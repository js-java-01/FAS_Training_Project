package com.example.starter_project_2025.system.learning.service;

import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.mapper.CourseMapper;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.learning.dto.EnrolledCourseResponse;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.dto.EnrollmentResponse;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMapper courseMapper;
    private final CourseClassRepository courseClassRepository;
    private final TopicMarkService topicMarkService;
    

    @Override
    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest request) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new RuntimeException("You are already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .enrolledAt(Instant.now())
                .status(EnrollmentStatus.ACTIVE)
                .build();

        enrollmentRepository.save(enrollment);

        // Initialize TopicMark entries for all existing CourseClasses of this course
        courseClassRepository.findByCourse_Id(course.getId()).forEach(courseClass ->
                topicMarkService.initializeForNewStudent(courseClass.getId(), user.getId()));

        return new EnrollmentResponse(
                enrollment.getId(),
                course.getId(),
                enrollment.getEnrolledAt(),
                enrollment.getStatus());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrolledCourseResponse> getMyEnrolledCourses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());

        return enrollments.stream()
                .filter(e -> e.getCourse() != null)
                .map(e -> EnrolledCourseResponse.builder()
                        .courseId(e.getCourse().getId())
                        .course(courseMapper.toResponse(e.getCourse()))
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
