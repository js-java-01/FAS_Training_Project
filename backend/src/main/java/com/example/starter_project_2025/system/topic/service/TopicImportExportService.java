package com.example.starter_project_2025.system.topic.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

public interface TopicImportExportService
{
    ByteArrayInputStream exportTopics() throws IOException;

    ByteArrayInputStream downloadTemplate() throws IOException;

    void importTopics(MultipartFile file) throws IOException;
}
