package com.example.starter_project_2025.system.student.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.student.dto.CreateStudentRequest;
import com.example.starter_project_2025.system.student.dto.StudentDTO;
import com.example.starter_project_2025.system.student.dto.UpdateStudentRequest;
import com.example.starter_project_2025.system.student.entity.Student;
import com.example.starter_project_2025.system.student.repository.StudentRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @PreAuthorize("hasAuthority('STUDENT_READ')")
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('STUDENT_READ')")
    public StudentDTO getStudentById(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return convertToDTO(student);
    }

    @PreAuthorize("hasAuthority('STUDENT_READ')")
    public StudentDTO getStudentByStudentId(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with student ID: " + studentId));
        return convertToDTO(student);
    }

    @PreAuthorize("hasAuthority('STUDENT_CREATE')")
    @Transactional
    public StudentDTO createStudent(CreateStudentRequest request) {
        // Validate student ID uniqueness
        if (studentRepository.existsByStudentId(request.getStudentId())) {
            throw new BadRequestException("Student ID already exists: " + request.getStudentId());
        }

        // Validate user exists and is not already a student
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (studentRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("User is already registered as a student");
        }

        Student student = new Student();
        student.setStudentId(request.getStudentId());
        student.setUser(user);
        student.setDateOfBirth(request.getDateOfBirth());
        student.setMajor(request.getMajor());
        student.setYearLevel(request.getYearLevel());
        student.setEnrollmentDate(request.getEnrollmentDate());
        student.setGraduationDate(request.getGraduationDate());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setAddress(request.getAddress());
        student.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        Student savedStudent = studentRepository.save(student);
        log.info("Created student with ID: {}", savedStudent.getStudentId());
        return convertToDTO(savedStudent);
    }

    @PreAuthorize("hasAuthority('STUDENT_UPDATE')")
    @Transactional
    public StudentDTO updateStudent(UUID id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getMajor() != null) {
            student.setMajor(request.getMajor());
        }
        if (request.getYearLevel() != null) {
            student.setYearLevel(request.getYearLevel());
        }
        if (request.getEnrollmentDate() != null) {
            student.setEnrollmentDate(request.getEnrollmentDate());
        }
        if (request.getGraduationDate() != null) {
            student.setGraduationDate(request.getGraduationDate());
        }
        if (request.getPhoneNumber() != null) {
            student.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }
        if (request.getStatus() != null) {
            student.setStatus(request.getStatus());
        }

        Student updatedStudent = studentRepository.save(student);
        log.info("Updated student with ID: {}", updatedStudent.getStudentId());
        return convertToDTO(updatedStudent);
    }

    @PreAuthorize("hasAuthority('STUDENT_DELETE')")
    @Transactional
    public void deleteStudent(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        
        studentRepository.delete(student);
        log.info("Deleted student with ID: {}", student.getStudentId());
    }

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setUserId(student.getUser().getId());
        dto.setEmail(student.getUser().getEmail());
        dto.setFirstName(student.getUser().getFirstName());
        dto.setLastName(student.getUser().getLastName());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setMajor(student.getMajor());
        dto.setYearLevel(student.getYearLevel());
        dto.setEnrollmentDate(student.getEnrollmentDate());
        dto.setGraduationDate(student.getGraduationDate());
        dto.setPhoneNumber(student.getPhoneNumber());
        dto.setAddress(student.getAddress());
        dto.setStatus(student.getStatus());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setUpdatedAt(student.getUpdatedAt());
        return dto;
    }
}
