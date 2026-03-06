package com.example.starter_project_2025.system.course_class.services;

import com.example.starter_project_2025.system.course_class.dto.CourseClassRequest;
import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.rbac.user.User;

import java.util.List;
import java.util.UUID;

public interface CourseClassService
{
    List<CourseClass> getByUser(User user);
    List<CourseClassResponse> getAll();
    CourseClassResponse getById(UUID id);

    List<CourseClassResponse> getByClassId(UUID classId);

    CourseClassResponse create(CourseClassRequest request);
}
