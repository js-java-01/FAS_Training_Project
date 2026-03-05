package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseLevelOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class CourseInitializer {

    private final CourseOnlineRepository courseOnlineRepository;

    public void init() {
        if (courseOnlineRepository.count() > 0) {
            return;
        }

        CourseOnline c1 = CourseOnline.builder()
                .courseName("Java Spring Boot Fundamentals")
                .courseCode("COURSE-001")
                .level(CourseLevelOnline.BEGINNER)
                .estimatedTime(1800)
                .status(CourseStatusOnline.ACTIVE)
                .description(
                        "Learn the fundamentals of Spring Boot including REST APIs, dependency injection, and JPA.")
                .build();

        CourseOnline c2 = CourseOnline.builder()
                .courseName("ReactJS & TypeScript Advanced")
                .courseCode("COURSE-002")
                .level(CourseLevelOnline.INTERMEDIATE)
                .estimatedTime(2400)
                .status(CourseStatusOnline.ACTIVE)
                .description("Deep dive into React hooks, context API, TypeScript integration, and state management.")
                .build();

        CourseOnline c3 = CourseOnline.builder()
                .courseName("Python for Data Science")
                .courseCode("COURSE-003")
                .level(CourseLevelOnline.INTERMEDIATE)
                .estimatedTime(2100)
                .status(CourseStatusOnline.ACTIVE)
                .description("Hands-on data analysis using Pandas, NumPy, Matplotlib and Scikit-learn.")
                .build();

        CourseOnline c4 = CourseOnline.builder()
                .courseName("Microservices with Docker & Kubernetes")
                .courseCode("COURSE-004")
                .level(CourseLevelOnline.ADVANCED)
                .estimatedTime(3000)
                .status(CourseStatusOnline.UNDER_REVIEW)
                .description(
                        "Design, build, and deploy microservices using Docker containers and Kubernetes orchestration.")
                .build();

        CourseOnline c5 = CourseOnline.builder()
                .courseName("Introduction to SQL & Database Design")
                .courseCode("COURSE-005")
                .level(CourseLevelOnline.BEGINNER)
                .estimatedTime(1200)
                .status(CourseStatusOnline.ACTIVE)
                .description("Covers relational database concepts, SQL queries, normalization, and schema design.")
                .build();

        courseOnlineRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5));

        System.out.println(">>> CourseInitializer: Đã khởi tạo dữ liệu mẫu thành công!");
    }
}
