package com.example.starter_project_2025.system.export.components;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExportSheetConfig<T> {

    String sheetName;
    List<ExportColumn<T>> columns;

    public ExportSheetConfig(
            String sheetName,
            List<ExportColumn<T>> columns
    ) {
        this.sheetName = sheetName;
        this.columns = columns;
    }
}
