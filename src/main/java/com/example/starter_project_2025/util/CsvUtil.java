package com.example.starter_project_2025.util;

import com.example.starter_project_2025.system.auth.dto.PermissionDTO;
import com.example.starter_project_2025.system.auth.dto.RoleDTO;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
public class CsvUtil {

    private static final String CSV_SEPARATOR = ",";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public String exportRolesToCsv(List<RoleDTO> roles) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Description,Hierarchy Level,Is Active,Permissions,Created At,Updated At\n");

        for (RoleDTO role : roles) {
            csv.append(escapeSpecialCharacters(role.getId().toString())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(role.getName())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(role.getDescription())).append(CSV_SEPARATOR);
//            csv.append(role.getHierarchyLevel()).append(CSV_SEPARATOR);
            csv.append(role.getIsActive()).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(
                    role.getPermissionNames() != null ? String.join(";", role.getPermissionNames()) : ""
            )).append(CSV_SEPARATOR);
            csv.append(role.getCreatedAt() != null ? role.getCreatedAt().format(DATE_FORMATTER) : "").append(CSV_SEPARATOR);
            csv.append(role.getUpdatedAt() != null ? role.getUpdatedAt().format(DATE_FORMATTER) : "");
            csv.append("\n");
        }

        return csv.toString();
    }

    public String exportUsersToCsv(List<UserDTO> users) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Email,First Name,Last Name,Role,Is Active,Created At,Updated At\n");

        for (UserDTO user : users) {
            csv.append(escapeSpecialCharacters(user.getId().toString())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(user.getEmail())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(user.getFirstName())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(user.getLastName())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(user.getRoleName())).append(CSV_SEPARATOR);
            csv.append(user.getIsActive()).append(CSV_SEPARATOR);
            csv.append(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "").append(CSV_SEPARATOR);
            csv.append(user.getUpdatedAt() != null ? user.getUpdatedAt().format(DATE_FORMATTER) : "");
            csv.append("\n");
        }

        return csv.toString();
    }

    public String exportPermissionsToCsv(List<PermissionDTO> permissions) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Description,Resource,Action\n");

        for (PermissionDTO permission : permissions) {
            csv.append(escapeSpecialCharacters(permission.getId().toString())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(permission.getName())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(permission.getDescription())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(permission.getResource())).append(CSV_SEPARATOR);
            csv.append(escapeSpecialCharacters(permission.getAction()));
            csv.append("\n");
        }

        return csv.toString();
    }

    public List<Map<String, String>> importRolesFromCsv(InputStream inputStream) throws IOException {
        List<Map<String, String>> roles = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return roles;
            }

            String[] headers = parseCsvLine(headerLine);
            String line;

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] values = parseCsvLine(line);
                Map<String, String> role = new HashMap<>();

                for (int i = 0; i < headers.length && i < values.length; i++) {
                    role.put(headers[i].trim(), values[i].trim());
                }

                roles.add(role);
            }
        }

        return roles;
    }

    public List<Map<String, String>> importUsersFromCsv(InputStream inputStream) throws IOException {
        List<Map<String, String>> users = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return users;
            }

            String[] headers = parseCsvLine(headerLine);
            String line;

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] values = parseCsvLine(line);
                Map<String, String> user = new HashMap<>();

                for (int i = 0; i < headers.length && i < values.length; i++) {
                    user.put(headers[i].trim(), values[i].trim());
                }

                users.add(user);
            }
        }

        return users;
    }

    public List<Map<String, String>> importPermissionsFromCsv(InputStream inputStream) throws IOException {
        List<Map<String, String>> permissions = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return permissions;
            }

            String[] headers = parseCsvLine(headerLine);
            String line;

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] values = parseCsvLine(line);
                Map<String, String> permission = new HashMap<>();

                for (int i = 0; i < headers.length && i < values.length; i++) {
                    permission.put(headers[i].trim(), values[i].trim());
                }

                permissions.add(permission);
            }
        }

        return permissions;
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null) {
            return "";
        }

        String escapedData = data.replace("\"", "\"\"");

        if (escapedData.contains(",") || escapedData.contains("\"") || escapedData.contains("\n")) {
            escapedData = "\"" + escapedData + "\"";
        }

        return escapedData;
    }

    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }

        result.add(current.toString());
        return result.toArray(new String[0]);
    }
}
