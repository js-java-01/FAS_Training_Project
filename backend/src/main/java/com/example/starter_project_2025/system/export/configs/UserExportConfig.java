package com.example.starter_project_2025.system.export.configs;

import com.example.starter_project_2025.system.export.components.ExportColumn;
import com.example.starter_project_2025.system.export.components.ExportSheetConfig;
import com.example.starter_project_2025.system.user.entity.User;

import java.util.List;

public class UserExportConfig {

        public static final ExportSheetConfig<User> CONFIG = new ExportSheetConfig<>(
                        "Users",
                        List.of(
                                        new ExportColumn<>("ID", User::getId),
                                        new ExportColumn<>("Name", User::getFirstName),
                                        new ExportColumn<>("Email", User::getEmail),
                                        new ExportColumn<>("Role", u -> u.getUserRoles().toString()),
                                        new ExportColumn<>("Created At", User::getCreatedAt)));
}
