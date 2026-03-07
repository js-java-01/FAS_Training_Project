package com.example.starter_project_2025.system.rbac.user;

import com.example.starter_project_2025.base.crud.BaseCrudDataIoController;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudService;
import com.example.starter_project_2025.base.dataio.common.FileFormat;
import com.example.starter_project_2025.base.dataio.importer.result.ImportResult;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController
        extends BaseCrudDataIoController<User, UUID, UserDTO, UserFilter> {

    UserService service;
    UserRepository repository;

    @Override
    protected CrudService<UUID, UserDTO, UserFilter> getService() {
        return service;
    }

    @Override
    protected BaseCrudRepository<User, UUID> getRepository() {
        return repository;
    }

    @Override
    protected Class<User> getEntityClass() {
        return User.class;
    }

    @Override
    @PreAuthorize("hasAuthority('USER_EXPORT')")
    public void exportFile(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response) throws IOException {
        super.exportFile(format, response);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_IMPORT')")
    public ImportResult importFile(
            @RequestParam("file") MultipartFile file) {
        return super.importFile(file);
    }
}
