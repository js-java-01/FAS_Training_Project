package com.example.starter_project_2025.system.user.service.impl;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.user.dto.CreateStudentRequest;
import com.example.starter_project_2025.system.user.dto.StudentDTO;
import com.example.starter_project_2025.system.user.entity.Student;
import com.example.starter_project_2025.system.user.enums.Gender;
import com.example.starter_project_2025.system.user.mapper.StudentMapper;
import com.example.starter_project_2025.system.user.repository.StudentRepository;
import com.example.starter_project_2025.system.user.service.StudentService;
import com.example.starter_project_2025.system.user.spec.StudentSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentServiceImpl implements StudentService {

    StudentRepository studentRepository;
    StudentMapper studentMapper;

    @Override
    @PreAuthorize("hasAuthority('STUDENT_READ')")
    public Page<StudentDTO> getAllStudents(
            String searchContent,
            Gender gender,
            BigDecimal minGpa,
            BigDecimal maxGpa,
            LocalDate dobFrom,
            LocalDate dobTo,
            Pageable pageable
    ) {
        Specification<Student> spec = Specification
                .where(StudentSpecification.hasStudentKeyword(searchContent))
                .and(StudentSpecification.hasGender(gender))
                .and(StudentSpecification.gpaGreaterThanOrEqual(minGpa))
                .and(StudentSpecification.gpaLessThanOrEqual(maxGpa))
                .and(StudentSpecification.dobAfter(dobFrom))
                .and(StudentSpecification.dobBefore(dobTo))
                .and(StudentSpecification.gpaLessThanOrEqual(maxGpa));

        return studentRepository.findAll(spec, pageable).map(studentMapper::toResponse);
    }

    @Override
    @PreAuthorize("hasAuthority('STUDENT_READ')")
    public StudentDTO getStudentById(UUID id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        return studentMapper.toResponse(student);
    }

    @Override
    @PreAuthorize("hasAuthority('STUDENT_CREATE')")
    public StudentDTO createStudent(CreateStudentRequest request) {

        if (studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new BadRequestException("Student code already exists: " + request.getStudentCode());
        }

        if (studentRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Student code already exists: " + request.getPhone());
        }

        Student student = studentMapper.toEntity(request);
        student.setGpa(BigDecimal.ZERO);

        return studentMapper.toResponse(studentRepository.save(student));
    }

    @Override
    @PreAuthorize("hasAuthority('STUDENT_UPDATE')")
    public StudentDTO updateStudent(UUID id, StudentDTO request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        if (studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new BadRequestException("Student code already exists: " + request.getStudentCode());
        }

        if (studentRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Student code already exists: " + request.getPhone());
        }

        studentMapper.update(student, request);

        return studentMapper.toResponse(studentRepository.save(student));
    }

    @Override
    @PreAuthorize("hasAuthority('STUDENT_DELETE')")
    public void deleteStudent(UUID id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        studentRepository.delete(student);
    }

}