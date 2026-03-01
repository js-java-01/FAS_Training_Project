package com.example.starter_project_2025.system.course_class.services;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.user.entity.User;

import java.util.List;

public interface CourseClassService
{
    List<CourseClass> getByUser(User user);
}
