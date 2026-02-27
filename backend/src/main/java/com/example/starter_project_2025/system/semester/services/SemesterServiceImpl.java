package com.example.starter_project_2025.system.semester.services;

import com.example.starter_project_2025.constant.ErrorMessage;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.semester.dto.SemesterCreateDto;
import com.example.starter_project_2025.system.semester.dto.SemesterResponse;
import com.example.starter_project_2025.system.semester.dto.SemesterUpdateDto;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.mapper.SemesterMapper;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService
{
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final CourseClassRepository courseClassRepository;
    private final SemesterMapper semesterMapper;
    private final TrainingClassRepository trainingClassRepository;

    @Override
    public List<SemesterResponse> getByUserId(UUID userId)
    {
        var user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException(ErrorMessage.USER_NOT_FOUND));
        var courseClasses = courseClassRepository.findByTrainer(user);
        var res = courseClasses.stream()
                .map(cc -> cc.getClassInfo().getSemester())
                .distinct()
                .toList();
        return res.stream().map(sm -> semesterMapper.toSemesterResponse(sm)).toList();
    }

    @Override
    public SemesterResponse createSemester(SemesterCreateDto data)
    {
        var checkNameExist = semesterRepository.existsByNameIgnoreCase(data.getName());
        if (checkNameExist)
        {
            throw new RuntimeException(ErrorMessage.SEMESTER_NAME_EXISTED);
        }
        var semester = new Semester();
        semester.setName(data.getName());
        semester.setStartDate(data.getStartDate());
        semester.setEndDate(data.getEndDate());
        var savedSemester = semesterRepository.save(semester);
        return semesterMapper.toSemesterResponse(savedSemester);
    }

    @Override
    public SemesterResponse updateSemester(SemesterUpdateDto data)
    {
        var checkNameExist = semesterRepository.existsByNameIgnoreCase(data.getName());
        if (checkNameExist)
        {
            throw new RuntimeException(ErrorMessage.SEMESTER_NAME_EXISTED);
        }
        var semester = semesterRepository.findById(data.getId()).orElseThrow(() -> new RuntimeException(ErrorMessage.SEMESTER_NOT_FOUND));
        semester.setName(data.getName());
        semester.setStartDate(data.getStartDate());
        semester.setEndDate(data.getEndDate());
        var savedSemester = semesterRepository.save(semester);
        return semesterMapper.toSemesterResponse(savedSemester);
    }

    @Override
    public void deleteSemester(UUID id)
    {
        var semester = semesterRepository.findById(id).orElseThrow(() -> new RuntimeException(ErrorMessage.SEMESTER_NOT_FOUND));
        semesterRepository.delete(semester);
    }

    @Override
    public Page<SemesterResponse> getAllSemesters(UUID userId, String role, String keyword, LocalDate startDate, LocalDate endDate, Pageable pageable)
    {
        Set<UUID> semesterIds = null;
        if (userId != null)
        {
            semesterIds = new HashSet<>();
            var user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException(ErrorMessage.USER_NOT_FOUND));
            List<TrainingClass> courseClassesManager;
            List<CourseClass> courseClassesTrainer;
            if (role.equals("MANAGER"))
            {
                courseClassesManager = trainingClassRepository.findByCreator(user);
                if (courseClassesManager != null && !courseClassesManager.isEmpty())
                {
                    semesterIds.addAll(courseClassesManager.stream().map(cc -> cc.getSemester().getId()).distinct().toList());
                }
            } else if (role.equals("TRAINER"))
            {
                courseClassesTrainer = courseClassRepository.findByTrainer(user);
                semesterIds.addAll(courseClassesTrainer.stream().map(cc -> cc.getClassInfo().getSemester().getId()).distinct().toList());
            }

            if (semesterIds.isEmpty())
            {
                return Page.empty(pageable);
            }
        }

        List<UUID> finalValidSemesterIds = (semesterIds != null) ? new ArrayList<>(semesterIds) : null;

        Specification<Semester> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (finalValidSemesterIds != null)
            {
                predicates.add(root.get("id").in(finalValidSemesterIds));
            }

            if (keyword != null && !keyword.trim().isEmpty())
            {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
            }

            if (startDate != null)
            {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), startDate));
            }

            if (endDate != null)
            {
                predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Semester> semesterPage = semesterRepository.findAll(spec, pageable);

        return semesterPage.map(sm -> semesterMapper.toSemesterResponse(sm));
    }
}
