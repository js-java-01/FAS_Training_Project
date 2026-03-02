package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.system.classes.dto.request.SearchClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.SearchTrainerClassInSemesterRequest;
import com.example.starter_project_2025.system.classes.dto.response.TrainerClassSemesterResponse;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.mapper.TrainerClassMapper;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.classes.spec.ClassSpecification;
import com.example.starter_project_2025.system.classes.dto.request.UpdateClassRequest;
import com.example.starter_project_2025.system.classes.dto.response.ClassResponse;
import com.example.starter_project_2025.system.classes.dto.request.CreateClassRequest;
import com.example.starter_project_2025.system.classes.dto.request.ReviewClassRequest;
import com.example.starter_project_2025.system.classes.entity.ClassStatus;

import com.example.starter_project_2025.system.classes.mapper.ClassMapper;
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
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassServiceImpl implements ClassService {

    private final TrainingClassRepository classRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final TrainerClassMapper trainerClassMapper;
    private final ClassMapper mapper;

    @Override
    public ClassResponse getTrainingClassById(UUID id) {
        TrainingClass trainingClass = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training class not found"));
        return mapper.toResponse(trainingClass);
    }

    @Override
    public ClassResponse openClassRequest(CreateClassRequest request, String email) {

        String className = StringNormalizer.normalize(request.getClassName());
        String classCode = StringNormalizer.normalize(request.getClassCode());

        if (classRepository.existsByClassNameIgnoreCase(className)) {
            throw new RuntimeException("Class name already exists");
        }

        if (classRepository.existsByClassCodeIgnoreCase(classCode)) {
            throw new RuntimeException("Class code already exists");
        }

        LocalDate today = LocalDate.now();
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (!endDate.isAfter(startDate)) {
            throw new RuntimeException("End date must be after start date");
        }

        if (startDate.isBefore(today)) {
            throw new RuntimeException("Start date must be today or in the future");
        }

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        if (semester.getEndDate().isBefore(today)) {
            throw new RuntimeException("Cannot open class for past semester");
        }

        if (startDate.isBefore(semester.getStartDate())
                || endDate.isAfter(semester.getEndDate())) {
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
        entity.setStartDate(startDate);
        entity.setEndDate(endDate);

        TrainingClass saved = classRepository.save(entity);

        return mapper.toResponse(saved);
    }

    @Override
    public ClassResponse updateClass(
            UUID id,
            UpdateClassRequest request,
            String email) {

        TrainingClass existing = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training class not found"));

        String className = request.getClassName() != null ? StringNormalizer.normalize(request.getClassName())
                : existing.getClassName();
        String classCode = request.getClassCode() != null ? StringNormalizer.normalize(request.getClassCode())
                : existing.getClassCode();

        if (request.getClassName() != null && classRepository.existsByClassNameIgnoreCaseAndIdNot(className, id)) {
            throw new RuntimeException("Class name already exists");
        }

        if (request.getClassCode() != null && classRepository.existsByClassCodeIgnoreCaseAndIdNot(classCode, id)) {
            throw new RuntimeException("Class code already exists");
        }

        LocalDate today = LocalDate.now();

        if (request.getStartDate() != null && request.getStartDate().isBefore(today)) {
            throw new RuntimeException("Start date must be today or in the future");
        }

        if (request.getEndDate() != null && request.getEndDate().isBefore(today)) {
            throw new RuntimeException("End date must be today or in the future");
        }

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : existing.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : existing.getEndDate();

        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Start date must be before end date");
        }

        Semester semester = existing.getSemester();
        if (request.getSemesterId() != null) {
            semester = semesterRepository.findById(request.getSemesterId())
                    .orElseThrow(() -> new RuntimeException("Semester not found"));

            if (semester.getEndDate().isBefore(today)) {
                throw new RuntimeException("Cannot assign class to past semester");
            }
        }

        if (startDate.isBefore(semester.getStartDate())
                || endDate.isAfter(semester.getEndDate())) {
            throw new RuntimeException("Class duration must be within semester period");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getClassName() != null)
            existing.setClassName(className);
        if (request.getClassCode() != null)
            existing.setClassCode(classCode);
        if (request.getSemesterId() != null)
            existing.setSemester(semester);
        if (request.getStartDate() != null)
            existing.setStartDate(startDate);
        if (request.getEndDate() != null)
            existing.setEndDate(endDate);

        TrainingClass saved = classRepository.save(existing);

        return mapper.toResponse(saved);
    }

    @Override
    public Page<ClassResponse> searchTrainingClasses(SearchClassRequest request, Pageable pageable) {
        Specification<TrainingClass> spec = Specification
                .where(ClassSpecification.filterClasses(request));

        Page<TrainingClass> page = classRepository.findAll(spec, pageable);
        return page.map(mapper::toResponse);
    }

    @Override
    public List<TrainingClassSemesterResponse> getMyClasses(UUID id) {
        List<TrainingClass> classes = classRepository.findByStudentId(id);
        return mapper.toSemesterResponse(classes);
    }

    public ClassResponse approveClass(UUID id, String approverEmail, ReviewClassRequest request) {

        TrainingClass trainingClass = classRepository.findById(id)
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

        if (!trainingClass.getStartDate().isAfter(LocalDate.now())) {
            trainingClass.setIsActive(true);
        } else {
            trainingClass.setIsActive(false);
        }

        return mapper.toResponse(trainingClass);
    }

    @Override
    @Transactional
    public ClassResponse rejectClass(UUID id, String approverEmail, ReviewClassRequest request) {

        TrainingClass trainingClass = classRepository.findById(id)
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

        classRepository.save(trainingClass);

        return mapper.toResponse(trainingClass);
    }

    @Override
    public TrainerClassSemesterResponse getTrainerClasses(UUID trainerId, SearchTrainerClassInSemesterRequest request) {
        Specification<TrainingClass> spec = ClassSpecification.filterTrainerClasses(trainerId, request);
        List<TrainingClass> classes = classRepository.findAll(spec);
        if (classes.isEmpty()) {
            throw new RuntimeException(ErrorMessage.TRAINING_CLASS_NOT_FOUND);
        }
        var mappedClasses = trainerClassMapper.toTrainerClassResponseList(classes);

        var semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new RuntimeException(ErrorMessage.SEMESTER_NOT_FOUND));

        var res = new TrainerClassSemesterResponse();
        res.setSemesterID(request.getSemesterId());
        res.setSemesterName(semester.getName());
        res.setClasses(mappedClasses);

        return res;
    }
}