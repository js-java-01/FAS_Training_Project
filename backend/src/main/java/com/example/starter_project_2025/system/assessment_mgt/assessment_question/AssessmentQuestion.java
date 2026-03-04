<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/assessment_question/AssessmentQuestion.java
package com.example.starter_project_2025.system.assessment.assessment_question;

import com.example.starter_project_2025.system.assessment.assessment.Assessment;
import com.example.starter_project_2025.system.assessment.question.Question;
========
package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.system.assessment_mgt.question.Question;
import com.example.starter_project_2025.system.assessment_mgt.assessment.Assessment;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/assessment_question/AssessmentQuestion.java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "assessment_questions")
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne
    @JoinColumn(name = "assessment_id", nullable = false)
    @JsonIgnoreProperties({ "assessmentQuestions", "handler", "hibernateLazyInitializer" })
    Assessment assessment;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnoreProperties({ "handler", "hibernateLazyInitializer","assessmentQuestions" })
    Question question;

    @Column(name = "score")
    Double score;

    @Column(name = "order_index")
    Integer orderIndex;
}