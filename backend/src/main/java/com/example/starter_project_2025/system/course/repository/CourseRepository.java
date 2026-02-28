package com.example.starter_project_2025.system.course.repository;

import com.example.starter_project_2025.system.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
        boolean existsByCourseCode(String courseCode);
        
        java.util.Optional<Course> findByCourseCode(String courseCode);

        @Query("SELECT c FROM Course c " +
                        "WHERE (:keyword IS NULL OR LOWER(c.courseName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
                        +
                        "AND (:status IS NULL OR c.status = :status) " +
                        "AND (:trainerId IS NULL OR c.creator.id = :trainerId)")
        org.springframework.data.domain.Page<Course> findAllByFilters(
                        @org.springframework.data.repository.query.Param("keyword") String keyword,
                        @org.springframework.data.repository.query.Param("status") com.example.starter_project_2025.system.course.enums.CourseStatus status,
                        @org.springframework.data.repository.query.Param("trainerId") java.util.UUID trainerId,
                        org.springframework.data.domain.Pageable pageable);

}
