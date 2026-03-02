package com.example.starter_project_2025.system.classes.mapper;

import com.example.starter_project_2025.system.classes.dto.response.CourseDetailsResponse;
import com.example.starter_project_2025.system.classes.dto.response.TraineeDetailsResponse;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import org.springframework.stereotype.Component;

@Component
public class ClassDetailsMapper {
    public TraineeDetailsResponse toTraineeDetailsResponse(Enrollment enrollment) {
        if (enrollment == null) {
            return null;
        }

        TraineeDetailsResponse response = new TraineeDetailsResponse();

        if (enrollment.getUser() != null) {
            response.setId(enrollment.getUser().getId());
            response.setEmail(enrollment.getUser().getEmail());
            response.setFirstName(enrollment.getUser().getFirstName());
            response.setLastName(enrollment.getUser().getLastName());
        }

        // if (enrollment.getTrainingClass() != null &&
        // enrollment.getTrainingClass().getSemester() != null)
        // {
        // response.setSemesterID(enrollment.getTrainingClass().getSemester().getId());
        // response.setSemesterName(enrollment.getTrainingClass().getSemester().getName());
        // }

        return response;
    }

    public CourseDetailsResponse toCourseDetailsResponse(CourseClass courseClass) {
        if (courseClass == null) {
            return null;
        }

        CourseDetailsResponse response = new CourseDetailsResponse();

        if (courseClass.getCourse() != null) {
            response.setId(courseClass.getCourse().getId());
            response.setCourseName(courseClass.getCourse().getCourseName());
            response.setCourseCode(courseClass.getCourse().getCourseCode());
            response.setLevel(courseClass.getCourse().getLevel());
            response.setNote(courseClass.getCourse().getNote());
            response.setDescription(courseClass.getCourse().getDescription());
            response.setMinGpaToPass(courseClass.getCourse().getMinGpaToPass());
            response.setMinAttendancePercent(courseClass.getCourse().getMinAttendancePercent());
            response.setAllowFinalRetake(courseClass.getCourse().getAllowFinalRetake());
        }

        if (courseClass.getClassInfo() != null && courseClass.getClassInfo().getSemester() != null) {
            response.setSemesterID(courseClass.getClassInfo().getSemester().getId());
            response.setSemesterName(courseClass.getClassInfo().getSemester().getName());
        }

        return response;
    }
}
