package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.UpdateTrainingClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.ReviewClassRequest;
import com.example.starter_project_2025.system.classes.entity.ClassStatus;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.mapper.TrainingClassMapper;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.modulegroups.util.StringNormalizer;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassServiceImpl implements ClassService {

    private final TrainingClassRepository trainingClassRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final TrainingClassMapper mapper;

    @Override
    public TrainingClassResponse getTrainingClassById(UUID id) {
        TrainingClass trainingClass = trainingClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training class not found"));
        return mapper.toResponse(trainingClass);
    }

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
        entity.setClassStatus(ClassStatus.PENDING_APPROVAL);
        entity.setIsActive(false);
        entity.setCreator(creator);
        entity.setSemester(semester);
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());

        TrainingClass saved = trainingClassRepository.save(entity);

        return mapper.toResponse(saved);
    }

    @Override
    public TrainingClassResponse updateClass(
            UUID id,
            UpdateTrainingClassRequest request,
            String email
    ) {

        TrainingClass existing = trainingClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training class not found"));

        // ===== NORMALIZE =====
        String className = request.getClassName() != null ? StringNormalizer.normalize(request.getClassName()) : existing.getClassName();
        String classCode = request.getClassCode() != null ? StringNormalizer.normalize(request.getClassCode()) : existing.getClassCode();

        // ===== DUPLICATE CHECK (exclude itself) =====
        if (request.getClassName() != null && trainingClassRepository.existsByClassNameIgnoreCaseAndIdNot(className, id)) {
            throw new RuntimeException("Class name already exists");
        }

        if (request.getClassCode() != null && trainingClassRepository.existsByClassCodeIgnoreCaseAndIdNot(classCode, id)) {
            throw new RuntimeException("Class code already exists");
        }

        // ===== DATE CHECK =====
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : existing.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : existing.getEndDate();

        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Start date must be before end date");
        }

        Semester semester = existing.getSemester();
        if (request.getSemesterId() != null) {
            semester = semesterRepository.findById(request.getSemesterId())
                    .orElseThrow(() -> new RuntimeException("Semester not found"));

            if (semester.getEndDate().isBefore(LocalDate.now())) {
                throw new RuntimeException("Cannot assign class to past semester");
            }
        }

        if (startDate.isBefore(semester.getStartDate())
                || endDate.isAfter(semester.getEndDate())) {
            throw new RuntimeException("Class duration must be within semester period");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ===== UPDATE DATA =====
        if (request.getClassName() != null) existing.setClassName(className);
        if (request.getClassCode() != null) existing.setClassCode(classCode);
        if (request.getSemesterId() != null) existing.setSemester(semester);
        if (request.getStartDate() != null) existing.setStartDate(startDate);
        if (request.getEndDate() != null) existing.setEndDate(endDate);

        // existing.setCreator(user); // Usually creator doesn't change on update.

        TrainingClass saved = trainingClassRepository.save(existing);

        return mapper.toResponse(saved);
    }

    @Override
    public TrainingClassResponse approveClass(UUID id, String approverEmail, ReviewClassRequest request) {

        TrainingClass trainingClass = trainingClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (trainingClass.getClassStatus() != ClassStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only pending classes can be approved");
        }

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        trainingClass.setClassStatus(ClassStatus.APPROVED);
        trainingClass.setApprover(approver);
        if (request != null) {
            trainingClass.setReviewReason(request.getReviewReason());
        }

        // 🔥 NEW LOGIC
        if (!trainingClass.getStartDate().isAfter(LocalDate.now())) {
            trainingClass.setIsActive(true);
        } else {
            trainingClass.setIsActive(false);
        }

        return mapper.toResponse(trainingClass);
    }

    @Override
    @Transactional
    public TrainingClassResponse rejectClass(UUID id, String approverEmail, ReviewClassRequest request) {

        TrainingClass trainingClass = trainingClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (trainingClass.getClassStatus() != ClassStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only pending classes can be rejected");
        }

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        trainingClass.setClassStatus(ClassStatus.REJECTED);
        trainingClass.setApprover(approver);
        trainingClass.setIsActive(false);
        if (request != null) {
            trainingClass.setReviewReason(request.getReviewReason());
        }

        trainingClassRepository.save(trainingClass);

        return mapper.toResponse(trainingClass);
    }

    @Override
    public Page<TrainingClassResponse> searchTrainingClasses(SearchClassRequest request) {
        String keyword = request.getKeyword();
        if (keyword != null) {
            keyword = keyword.trim();
            if (keyword.isEmpty()) {
                keyword = null;
            }
        }

        return trainingClassRepository
                .search(keyword, request.getIsActive(), request.getPageable())
                .map(mapper::toResponse);
    }

}