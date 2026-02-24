package com.example.starter_project_2025.system.export.components;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.function.Function;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExportColumn<T> {

    String header;
    Function<T, Object> valueExtractor;

    public ExportColumn(
            String header,
            Function<T, Object> valueExtractor
    ) {
        this.header = header;
        this.valueExtractor = valueExtractor;
    }

}

