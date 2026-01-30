package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessService;

    @PostMapping
    public ResponseEntity<Assessment> create(@Valid @RequestBody Assessment assessment) {

        Assessment saved = assessService.createAssessment(assessment);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assessment> update(@PathVariable String id, @Valid @RequestBody Assessment assessment) {
        try {
            Assessment updated = assessService.updateAssessment(id, assessment);
            return ResponseEntity.ok(updated);
        }catch (RuntimeException e){
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllAssessments() {
        try {
            List<Assessment> assessments = assessService.getAllAssessments();
            return ResponseEntity.ok(assessments);
        }catch (RuntimeException e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getAssessmentById(@PathVariable String id) {
        try {
            Assessment assessment = assessService.findById(id);
            return ResponseEntity.ok(assessment);
        }catch (RuntimeException e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/search/name")
    public ResponseEntity<?> getAssessmentByName(@RequestParam String name) {
        try {
            List<Assessment> assessments = assessService.findAssessmentByName(name);
            return ResponseEntity.ok(assessments);
        }catch (RuntimeException e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void deleteAssessment(@PathVariable String id) {

            Assessment ass = assessService.findById(id);
            assessService.deleteAssessment(id);

    }
}
