package com.example.starter_project_2025.system.learning.service.enroll;

import com.example.starter_project_2025.system.classes.dto.response.TrainingClassSemesterResponse;
import com.example.starter_project_2025.system.learning.dto.EnrollmentImportResult;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.dto.ImportEnrollmentError;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public interface EnrollmentService {

    // TrainingClassSemesterResponse enroll(EnrollmentRequest request);

    // List<CourseResponse> getMyEnrolledCourses();

    String enroll(EnrollmentRequest request);

    byte[] getExportTemplate();

    EnrollmentImportResult importStudents(MultipartFile file, String classCode);

    byte[] createErrorExcelFile(List<ImportEnrollmentError> errors);
    // List<EnrolledCourseResponse> getMyEnrolledCourses();

    byte[] getExport(String classCode);
}
