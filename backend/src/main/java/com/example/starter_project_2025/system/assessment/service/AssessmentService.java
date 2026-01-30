package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessRepo;

    public Assessment findById(String id) {
        Assessment assess = assessRepo.findAssessmentById(id);
        if (assess == null) {
            throw new RuntimeException("Assessment not found with id: " + id);
        }
        return assess;
    }

    public List<Assessment> findAssessmentByName(String name) {
        List<Assessment> assessments = assessRepo.findByNameContainingIgnoreCase(name);
        if(assessments.isEmpty()) {
            throw new RuntimeException("Assessment not found with name: " + name);
        }
        return assessments;
    }

    public List<Assessment> getAllAssessments() {
        List<Assessment> assessments = assessRepo.findAll();
        if(assessments.isEmpty()) {
            throw new RuntimeException("No assessments found");
        }
        return assessments;
    }

    public Assessment updateAssessment(String id, Assessment update) {
        Assessment existing = assessRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        if (update.getName() != null && !update.getName().equals(existing.getName()) && assessRepo.existsByName(update.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Assessment name already in use");
        }

        existing.setName(update.getName() != null ? update.getName() : existing.getName());
        existing.setDescription(update.getDescription() != null ? update.getDescription() : existing.getDescription());
        existing.setCreatedAt(update.getCreatedAt() != null ? update.getCreatedAt() : existing.getCreatedAt());
        return assessRepo.save(existing);
    }

    public Assessment createAssessment(Assessment assessment) {
        if (assessment.getId() == null || assessment.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id must not be blank");
        }
        if (assessRepo.existsById(assessment.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Assessment with id already exists");
        }
        if (assessRepo.existsByName(assessment.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Assessment with name already exists");
        }
        return assessRepo.save(assessment);
    }

    public void deleteAssessment(String id) {
        Assessment ass = assessRepo.findAssessmentById(id);
        if(ass == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found with id: " + id);
        }

        assessRepo.deleteById(id);
    }
}
