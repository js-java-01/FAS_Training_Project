package com.example.starter_project_2025.system.course_online.feedback;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.rbac.user.User;
import org.mapstruct.*;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CourseOnlineFeedbackMapper extends BaseCrudMapper<CourseOnlineFeedback, CourseOnlineFeedbackDTO> {

    @Override
    // 1. SỬA MAPPING: Map thẳng vào Object bằng custom method (qualifiedByName)
    @Mapping(target = "courseOnline", source = "courseOnlineId", qualifiedByName = "idToCourseOnline")
    @Mapping(target = "student", source = "studentId", qualifiedByName = "idToUser")
    // Đã xóa dòng map firstName ở toEntity để tránh lỗi sửa nhầm data User
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CourseOnlineFeedback toEntity(CourseOnlineFeedbackDTO request);

    @Override
    @Mapping(target = "courseOnlineId", source = "courseOnline.id")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.firstName") // Chiều này giữ nguyên là đúng
    CourseOnlineFeedbackDTO toResponse(CourseOnlineFeedback entity);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "courseOnline", ignore = true) // Ko cho phép đổi khóa học khác khi sửa review
    @Mapping(target = "student", ignore = true)   
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget CourseOnlineFeedback entity, CourseOnlineFeedbackDTO request);


    // --- 2. THÊM CÁC HÀM CUSTOM NÀY ĐỂ FIX TRỰC TIẾP LỖI NULL ID ---

    @Named("idToCourseOnline")
    default CourseOnline idToCourseOnline(UUID id) {
        if (id == null) {
            return null;
        }
        // Tự tạo entity rỗng và nhét ID vào để Hibernate hiểu khóa ngoại
        CourseOnline course = new CourseOnline();
        course.setId(id);
        return course;
    }

    @Named("idToUser")
    default User idToUser(UUID id) {
        if (id == null) {
            return null;
        }
        // Tự tạo entity rỗng và nhét ID vào để Hibernate hiểu khóa ngoại
        User user = new User();
        user.setId(id);
        return user;
    }
}