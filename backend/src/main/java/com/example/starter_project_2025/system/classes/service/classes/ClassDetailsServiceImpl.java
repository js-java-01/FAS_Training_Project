package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.request.CourseSearchRequest;
import com.example.starter_project_2025.system.classes.dto.response.CourseDetailsResponse;
import com.example.starter_project_2025.system.classes.dto.response.TraineeDetailsResponse;
import com.example.starter_project_2025.system.classes.mapper.ClassDetailsMapper;
import com.example.starter_project_2025.system.classes.spec.ClassDetailsSpecification;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassDetailsServiceImpl implements ClassDetailsService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseClassRepository courseClassRepository;
    private final ClassDetailsMapper classDetailsMapper;

    @Override
    public Page<TraineeDetailsResponse> getTraineesOfClass(UUID classId, String keyword, Pageable pageable) {
        Specification<Enrollment> spec = ClassDetailsSpecification.searchTrainees(classId, keyword);

        return enrollmentRepository.findAll(spec, pageable)
                .map(classDetailsMapper::toTraineeDetailsResponse);
    }

    @Override
    public Page<CourseDetailsResponse> getCoursesOfClass(UUID classId, CourseSearchRequest request, Pageable pageable) {
        Specification<CourseClass> spec = ClassDetailsSpecification.searchCourses(classId, request);

        return courseClassRepository.findAll(spec, pageable)
                .map(classDetailsMapper::toCourseDetailsResponse);
    }
}
