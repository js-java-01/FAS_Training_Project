package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class AssessmentTypeInitializer
{

    private final AssessmentTypeRepository assessmentTypeRepository;

    public void init()
    {
        if (assessmentTypeRepository.count() > 0)
        {
            return;
        }

        List<AssessmentType> list = new ArrayList<>();

        list.add(create("Entrance Quiz", "Đánh giá kiến thức đầu vào của học viên"));
        list.add(create("Midterm Test", "Kiểm tra giữa kỳ để đánh giá tiến độ học tập"));
        list.add(create("Final Exam", "Bài thi kết thúc môn học (Lý thuyết)"));

        list.add(create("Lab Exercise", "Bài tập thực hành nhỏ sau mỗi buổi học"));
        list.add(create("Mini Project", "Dự án nhỏ thực hiện sau mỗi module"));
        list.add(create("Final Project", "Đồ án cuối khóa tổng hợp kiến thức"));

        list.add(create("Attendance", "Điểm chuyên cần và tham gia lớp học"));
        list.add(create("Presentation", "Kỹ năng thuyết trình và làm việc nhóm"));
        list.add(create("Assignment", "Bài tập về nhà hàng tuần"));
        list.add(create("Mock Interview", "Phỏng vấn thử để đánh giá kỹ năng thực tế"));

        assessmentTypeRepository.saveAll(list);
        System.out.println(">>> [INIT] Đã khởi tạo 10 loại Assessment Types.");
    }

    private AssessmentType create(String name, String desc)
    {
        AssessmentType type = new AssessmentType();
        type.setName(name);
        type.setDescription(desc);
        return type;
    }
}