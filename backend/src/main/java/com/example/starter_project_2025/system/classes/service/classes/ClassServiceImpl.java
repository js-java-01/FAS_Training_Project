package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.mapper.TrainingClassMapper;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.classes.spec.ClassSpecification;
import com.example.starter_project_2025.system.modulegroups.util.StringNormalizer;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassServiceImpl implements ClassService {

    private final TrainingClassRepository trainingClassRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final TrainingClassMapper mapper;

    @Override
    public TrainingClassResponse openClassRequest(CreateTrainingClassRequest request, String email) {

        // ===== NORMALIZE =====
        String className = StringNormalizer.normalize(request.getClassName());
        String classCode = StringNormalizer.normalize(request.getClassCode());

        // ===== DUPLICATE CHECK =====
        if (trainingClassRepository.existsByClassNameIgnoreCase(className)) {
            throw new RuntimeException("Class name already exists");
        }

        if (trainingClassRepository.existsByClassCodeIgnoreCase(classCode)) {
            throw new RuntimeException("Class code already exists");
        }

        // ===== DATE CHECK =====
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date must be before end date");
        }

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        // ===== SEMESTER MUST BE CURRENT OR FUTURE =====
        if (semester.getEndDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot open class for past semester");
        }

        // ===== CLASS DURATION MUST INSIDE SEMESTER =====
        if (request.getStartDate().isBefore(semester.getStartDate())
                || request.getEndDate().isAfter(semester.getEndDate())) {
            throw new RuntimeException("Class duration must be within semester period");
        }

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TrainingClass entity = new TrainingClass();
        entity.setClassName(className);
        entity.setClassCode(classCode);
        entity.setIsActive(false);
        entity.setCreator(creator);
        entity.setSemester(semester);
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());

        TrainingClass saved = trainingClassRepository.save(entity);

        return mapper.toResponse(saved);
    }

    @Override
    public Page<TrainingClassResponse> searchTrainingClasses(SearchClassRequest request, Pageable pageable) {
        Specification<TrainingClass> spec = Specification
                .where(ClassSpecification.filterClasses(request));

        Page<TrainingClass> page = trainingClassRepository.findAll(spec, pageable);
        return page.map(mapper::toResponse);
    }

}