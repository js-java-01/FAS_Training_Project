package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessRepo;
    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public AssessmentDTO findById(String id) {
        return assessRepo.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));
    }
    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")

    public List<AssessmentDTO> findAssessmentByName(String name) {
        return assessRepo.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::toDTO)
                .toList();
    }
    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")

    public List<AssessmentDTO> getAllAssessments() {
        return assessRepo.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }
    @PreAuthorize("hasAuthority('ASSESSMENT_UPDATE')")
    public AssessmentDTO updateAssessment(String id, UpdateAssessmentRequest request) {
        Assessment assessment = assessRepo.findAssessmentById(id);
        if (assessment == null) {
            throw new ResourceNotFoundException("Assessment", "id", id);
        }

        if (request.getName() != null) {
            assessment.setName(request.getName());
        }
        if (request.getDescription() != null) {
            assessment.setDescription(request.getDescription());
        }

        return toDTO(assessRepo.save(assessment));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")

    public AssessmentDTO createAssessment(CreateAssessmentRequest request) {
        Assessment assessment = new Assessment();
        assessment.setName(request.getName());
        assessment.setDescription(request.getDescription());

        Assessment saved = assessRepo.save(assessment);
        return toDTO(saved);
    }
    @PreAuthorize("hasAuthority('ASSESSMENT_DELETE')")
    public void deleteAssessment(String id) {
        Assessment ass = assessRepo.findAssessmentById(id);
        if(ass == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found with id: " + id);
        }

        assessRepo.deleteById(id);
    }



    private AssessmentDTO toDTO(Assessment a) {
        AssessmentDTO dto = new AssessmentDTO();
        dto.setId(a.getId());
        dto.setName(a.getName());
        dto.setDescription(a.getDescription());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
