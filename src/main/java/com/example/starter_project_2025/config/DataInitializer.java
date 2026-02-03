package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.menu.entity.Menu;
import com.example.starter_project_2025.system.menu.entity.MenuItem;
import com.example.starter_project_2025.system.menu.repository.MenuItemRepository;
import com.example.starter_project_2025.system.menu.repository.MenuRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.location.data.entity.Commune;
import com.example.starter_project_2025.system.location.data.entity.Province;
import com.example.starter_project_2025.system.location.data.repository.CommuneRepository;
import com.example.starter_project_2025.system.location.data.repository.ProvinceRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final ProvinceRepository provinceRepository;
    private final CommuneRepository communeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database with sample data...");

        if (roleRepository.count() == 0) {
            initializePermissions();
            initializeRoles();
            initializeUsers();
            initializeMenus();
        } else {
            log.info("Database already initialized, skipping core data initialization.");
        }

        initializeLocationData();
        log.info("Database initialization completed successfully!");
    }

    private void initializePermissions() {
        List<Permission> permissions = Arrays.asList(
                createPermission("MENU_CREATE", "Create new menus", "MENU", "CREATE"),
                createPermission("MENU_READ", "View menus", "MENU", "READ"),
                createPermission("MENU_UPDATE", "Update existing menus", "MENU", "UPDATE"),
                createPermission("MENU_DELETE", "Delete menus", "MENU", "DELETE"),
                createPermission("MENU_ITEM_CREATE", "Create new menu items", "MENU_ITEM", "CREATE"),
                createPermission("MENU_ITEM_READ", "View menu items", "MENU_ITEM", "READ"),
                createPermission("MENU_ITEM_UPDATE", "Update existing menu items", "MENU_ITEM", "UPDATE"),
                createPermission("MENU_ITEM_DELETE", "Delete menu items", "MENU_ITEM", "DELETE"),
                createPermission("USER_CREATE", "Create new users", "USER", "CREATE"),
                createPermission("USER_READ", "View users", "USER", "READ"),
                createPermission("USER_UPDATE", "Update existing users", "USER", "UPDATE"),
                createPermission("USER_DELETE", "Delete users", "USER", "DELETE"),
                createPermission("USER_ACTIVATE", "Activate/deactivate users", "USER", "ACTIVATE"),
                createPermission("ROLE_CREATE", "Create new roles", "ROLE", "CREATE"),
                createPermission("ROLE_READ", "View roles", "ROLE", "READ"),
                createPermission("ROLE_UPDATE", "Update existing roles", "ROLE", "UPDATE"),
                createPermission("ROLE_DELETE", "Delete roles", "ROLE", "DELETE"),
                createPermission("ROLE_ASSIGN", "Assign roles to users", "ROLE", "ASSIGN"),
                createPermission("LOCATION_CREATE", "Create new locations", "LOCATION", "CREATE"),
                createPermission("LOCATION_READ", "View locations", "LOCATION", "READ"),
                createPermission("LOCATION_UPDATE", "Update existing locations", "LOCATION", "UPDATE"),
                createPermission("LOCATION_DELETE", "Delete locations", "LOCATION", "DELETE"),
                createPermission("DEPARTMENT_CREATE", "Create new departments", "DEPARTMENT", "CREATE"),
                createPermission("DEPARTMENT_READ", "View departments", "DEPARTMENT", "READ"),
                createPermission("DEPARTMENT_UPDATE", "Update existing departments", "DEPARTMENT", "UPDATE"),
                createPermission("DEPARTMENT_DELETE", "Delete departments", "DEPARTMENT", "DELETE")
        );
        permissionRepository.saveAll(permissions);
        log.info("Initialized {} permissions", permissions.size());
    }

    private Permission createPermission(String name, String description, String resource, String action) {
        Permission permission = new Permission();
        permission.setName(name);
        permission.setDescription(description);
        permission.setResource(resource);
        permission.setAction(action);
        return permission;
    }

    private void initializeRoles() {
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        adminRole.setDescription("Administrator with full system access");
//        adminRole.setHierarchyLevel(1);
        adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
        roleRepository.save(adminRole);

        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        studentRole.setDescription("Student with limited access to educational resources");
//        studentRole.setHierarchyLevel(2);
        studentRole.setPermissions(new HashSet<>(permissionRepository.findByAction("READ")));
        roleRepository.save(studentRole);

        log.info("Initialized 2 roles: ADMIN and STUDENT");
    }

    private void initializeUsers() {
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();

        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPasswordHash(passwordEncoder.encode("password123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole(adminRole);
        admin.setIsActive(true);
        userRepository.save(admin);

        User student1 = new User();
        student1.setEmail("student@example.com");
        student1.setPasswordHash(passwordEncoder.encode("password123"));
        student1.setFirstName("John");
        student1.setLastName("Doe");
        student1.setRole(studentRole);
        student1.setIsActive(true);
        userRepository.save(student1);

        User student2 = new User();
        student2.setEmail("jane.smith@example.com");
        student2.setPasswordHash(passwordEncoder.encode("password123"));
        student2.setFirstName("Jane");
        student2.setLastName("Smith");
        student2.setRole(studentRole);
        student2.setIsActive(true);
        userRepository.save(student2);

        log.info("Initialized 3 users (admin@example.com, student@example.com, jane.smith@example.com)");
    }

    private void initializeMenus() {
        Menu mainMenu = new Menu();
        mainMenu.setName("Main Menu");
        mainMenu.setDescription("Primary navigation menu");
        mainMenu.setIsActive(true);
        mainMenu.setDisplayOrder(1);
        mainMenu = menuRepository.save(mainMenu);

        MenuItem dashboard = createMenuItem(mainMenu, null, "Dashboard", "/dashboard", "dashboard", 1, null);
        menuItemRepository.save(dashboard);

        Menu adminMenu = new Menu();
        adminMenu.setName("Administration");
        adminMenu.setDescription("Administrative functions menu");
        adminMenu.setIsActive(true);
        adminMenu.setDisplayOrder(2);
        adminMenu = menuRepository.save(adminMenu);

        MenuItem userManagement = createMenuItem(adminMenu, null, "User Management", "/users", "people", 1, "USER_READ");
        MenuItem roleManagement = createMenuItem(adminMenu, null, "Role Management", "/roles", "security", 2, "ROLE_READ");
        MenuItem locationManagement = createMenuItem(adminMenu, null, "Location Management", "/locations", "location", 3, "LOCATION_READ");
        MenuItem departmentManagement = createMenuItem(adminMenu, null, "Department Management", "/departments", "department", 4, "DEPARTMENT_READ");

        menuItemRepository.saveAll(Arrays.asList(userManagement, roleManagement, locationManagement, departmentManagement));

        log.info("Initialized 2 menus with menu items");
    }

    private MenuItem createMenuItem(Menu menu, MenuItem parent, String title, String url, String icon, int order, String permission) {
        MenuItem item = new MenuItem();
        item.setMenu(menu);
        item.setParent(parent);
        item.setTitle(title);
        item.setUrl(url);
        item.setIcon(icon);
        item.setDisplayOrder(order);
        item.setIsActive(true);
        item.setRequiredPermission(permission);
        return item;
    }

    private void initializeLocationData() {
        if (provinceRepository.count() > 0 || communeRepository.count() > 0) {
            log.info("Location data already initialized, skipping location data import.");
            return;
        }

        try (InputStream inputStream = new ClassPathResource("LocationData.json").getInputStream()) {
            LocationDataJson locationData = objectMapper.readValue(inputStream, LocationDataJson.class);

            List<Province> provinces = locationData.province().stream()
                    .map(p -> new Province(p.idProvince(), p.name()))
                    .toList();
            provinceRepository.saveAll(provinces);

            Map<String, Province> provinceById = provinces.stream()
                    .collect(Collectors.toMap(Province::getId, Function.identity()));

            List<Commune> communes = locationData.commune().stream()
                    .map(c -> new Commune(c.idCommune(), c.name(), provinceById.get(c.idProvince())))
                    .toList();
            communeRepository.saveAll(communes);

            log.info("Initialized {} provinces and {} communes", provinces.size(), communes.size());
        } catch (IOException e) {
            log.error("Failed to import location data from LocationData.json", e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record LocationDataJson(List<ProvinceJson> province, List<CommuneJson> commune) { }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ProvinceJson(String idProvince, String name) { }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CommuneJson(String idProvince, String idCommune, String name) { }
}
