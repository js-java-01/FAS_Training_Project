package com.example.starter_project_2025.system.course_online.feedback;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.UnauthenticatedException;
import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;

import com.example.starter_project_2025.system.rbac.user.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseOnlineFeedbackServiceImpl
        extends CrudServiceImpl<CourseOnlineFeedback, UUID, CourseOnlineFeedbackDTO, CourseOnlineFeedbackFilter>
        implements CourseOnlineFeedbackService {

    CourseOnlineFeedbackRepository repository;
    CourseOnlineFeedbackMapper mapper;
    UserRepository userRepository;
    CourseOnlineRepository courseOnlineRepository;

    @Override
    protected BaseCrudRepository<CourseOnlineFeedback, UUID> getRepository() { 
        return repository; 
    }

    @Override
    protected BaseCrudMapper<CourseOnlineFeedback, CourseOnlineFeedbackDTO> getMapper() { 
        return mapper; 
    }

    @Override
    public CourseOnlineFeedbackDTO create(CourseOnlineFeedbackDTO request) {
        
        // 1. Lấy thông tin xác thực từ Spring Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }

        // 2. Ép kiểu về UserDetailsImpl của hệ thống để lấy ID và Role
        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();
        UUID currentUserId = currentUser.getId();

        // 3. Check Role trực tiếp từ UserDetailsImpl 
        if (!"STUDENT".equalsIgnoreCase(currentUser.getRole())) {
            throw new BadRequestException("Chỉ học viên mới được phép đánh giá khóa học!");
        }

       
        // 6. Validate Spam: Đã đánh giá khóa học này chưa?
        if (repository.existsByCourseOnlineIdAndStudentId(request.getCourseOnlineId(), currentUserId)) {
            throw new BadRequestException("Bạn đã gửi đánh giá cho khóa học này rồi!");
        }

        if (request.getCourseOnlineId() == null) {
            throw new BadRequestException("Mã khóa học (courseOnlineId) không được để trống!");
        }

        // 7. Ghi đè ID học viên vào request để Mapper tự động liên kết Entity
        request.setStudentId(currentUserId);
        request.setStatus(FeedbackStatus.APPROVED);

       
        return super.createEntity(request);
    }

    @Override
    public Page<CourseOnlineFeedbackDTO> getAll(Pageable pageable, String search, CourseOnlineFeedbackFilter filter) {
        // TODO Auto-generated method stub
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public CourseOnlineFeedbackDTO getById(UUID id) {
        // TODO Auto-generated method stub
        return super.getByIdEntity(id);
    }

    @Override
    public CourseOnlineFeedbackDTO update(UUID id, CourseOnlineFeedbackDTO request) {
        // 1. Lấy thông tin xác thực từ Spring Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }

        // 2. Lấy ID người dùng hiện tại
        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();
        UUID currentUserId = currentUser.getId();

        // 3. Tìm feedback cần update
        CourseOnlineFeedback existingFeedback = repository.findById(id)
            .orElseThrow(() -> new BadRequestException("Không tìm thấy đánh giá với ID: " + id));

        // 4. Kiểm tra quyền sở hữu: Chỉ người tạo mới được sửa
        if (!existingFeedback.getStudent().getId().equals(currentUserId)) {
            throw new BadRequestException("Bạn không có quyền sửa đánh giá này!");
        }

        // 5. Chỉ cập nhật rating và comment
        if (request.getRating() != null) {
            existingFeedback.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            existingFeedback.setComment(request.getComment());
        }

        // 6. Lưu và trả về
        CourseOnlineFeedback updatedFeedback = repository.save(existingFeedback);
        return mapper.toResponse(updatedFeedback);
    }

    @Override
    public void delete(UUID id) {
        // 1. Lấy thông tin xác thực từ Spring Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }

        // 2. Lấy ID người dùng hiện tại
        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();
        UUID currentUserId = currentUser.getId();

        // 3. Tìm feedback cần xóa
        CourseOnlineFeedback existingFeedback = repository.findById(id)
            .orElseThrow(() -> new BadRequestException("Không tìm thấy đánh giá với ID: " + id));

        // 4. Kiểm tra quyền sở hữu: Chỉ người tạo mới được xóa
        if (!existingFeedback.getStudent().getId().equals(currentUserId)) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này!");
        }

        // 5. Xóa feedback
        super.deleteEntity(id);
    }

    @Override
    protected String[] searchableFields() {
        // TODO Auto-generated method stub
        return new String[] { "courseOnline.name", "student.firstName", "student.lastName" };
    }

    @Override
    protected void beforeCreate(CourseOnlineFeedback entity, CourseOnlineFeedbackDTO request) {

    }

    @Override
    protected void beforeUpdate(CourseOnlineFeedback entity, CourseOnlineFeedbackDTO request) {

    }
}