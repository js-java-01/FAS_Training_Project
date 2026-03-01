package com.example.starter_project_2025.system.learning.service.enroll;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class EnrollmentServiceImpl implements EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final UserRepository userRepository;

    @Override
    public String enroll(EnrollmentRequest request, UUID id) {
        var classes = trainingClassRepository.findById(request.getClassID())
                .orElseThrow(() -> new RuntimeException("Class not found"));
        if (!classes.getEnrollmentKey().equals(request.getEnrollKey())) {
            throw new RuntimeException("Invalid enrollment key");
        }
        var user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        var existingEnrollment = enrollmentRepository.findByUserIdAndTrainingClassId(id, request.getClassID());
        if (existingEnrollment.isPresent()) {
            throw new RuntimeException("Already enrolled in this class");
        }
        var enrollment = new Enrollment();
        enrollment.setUser(user);
        // enrollment.setTrainingClass(classes);
        enrollmentRepository.save(enrollment);
        return "Enrollment successful";
    }

}
