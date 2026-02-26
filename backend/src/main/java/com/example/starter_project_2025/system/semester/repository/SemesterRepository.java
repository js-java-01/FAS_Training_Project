package com.example.starter_project_2025.system.semester.repository;

import com.example.starter_project_2025.system.semester.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;
import java.util.List;

public interface SemesterRepository extends JpaRepository<Semester, UUID> {
	@Query(value = "SELECT id, name, start_date AS startDate, end_date AS endDate FROM semester ORDER BY start_date ASC", nativeQuery = true)
	List<SemesterOptionProjection> findAllForDropdown();
}
