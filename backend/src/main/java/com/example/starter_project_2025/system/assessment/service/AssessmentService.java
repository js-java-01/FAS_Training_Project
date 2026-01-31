package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.mapper.AssessmentMapper;
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
    private AssessmentMapper assessmentMapper;

    @Autowired
    private AssessmentRepository assessRepo;


    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public AssessmentDTO findById(String id) {
        Assessment assessment = assessRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));
        return assessmentMapper.toDto(assessment);
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public List<AssessmentDTO> findAssessmentByName(String name) {
        return assessmentMapper.toDto(
                assessRepo.findByNameContainingIgnoreCase(name)
        );
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public List<AssessmentDTO> getAllAssessments() {
        return assessmentMapper.toDto(assessRepo.findAll());
    }


    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")
    public AssessmentDTO createAssessment(CreateAssessmentRequest request) {
        Assessment assessment = assessmentMapper.toEntity(request);
        return assessmentMapper.toDto(assessRepo.save(assessment));
    }


    @PreAuthorize("hasAuthority('ASSESSMENT_UPDATE')")
    public AssessmentDTO updateAssessment(String id, UpdateAssessmentRequest request) {
        Assessment assessment = assessRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));

        assessmentMapper.updateEntityFromRequest(request, assessment);

        return assessmentMapper.toDto(assessRepo.save(assessment));
    }


    @PreAuthorize("hasAuthority('ASSESSMENT_DELETE')")
    public void deleteAssessment(String id) {
        Assessment assessment = assessRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assessment not found with id: " + id
                ));

        assessRepo.delete(assessment);
    }

}
