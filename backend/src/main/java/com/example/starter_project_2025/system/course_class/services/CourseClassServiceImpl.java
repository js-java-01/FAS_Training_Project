package com.example.starter_project_2025.system.course_class.services;

import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseClassServiceImpl implements CourseClassService
{
    private final CourseClassRepository courseClassRepository;

    @Override
    public List<CourseClass> getByUser(User user)
    {
        return courseClassRepository.findByTrainer(user);
    }
}
