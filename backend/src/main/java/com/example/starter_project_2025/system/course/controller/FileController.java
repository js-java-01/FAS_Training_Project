package com.example.starter_project_2025.system.course.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File", description = "Serve uploaded material files")
public class FileController {

    @Value("${material.upload.dir:uploads/materials}")
    private String uploadDir;

    @GetMapping("/materials/{filename:.+}")
    @Operation(summary = "Serve a material file (supports range requests for video)")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String filename,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {

        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();

            // Security: ensure path stays within upload dir
            if (!filePath.startsWith(Paths.get(uploadDir).toAbsolutePath().normalize())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            long contentLength = Files.size(filePath);

            // Support Range requests for video streaming
            if (rangeHeader != null && !rangeHeader.isEmpty()) {
                HttpRange range = HttpRange.parseRanges(rangeHeader).get(0);
                long start = range.getRangeStart(contentLength);
                long end = range.getRangeEnd(contentLength);
                long rangeLength = end - start + 1;

                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_RANGE,
                                "bytes " + start + "-" + end + "/" + contentLength)
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .contentLength(rangeLength)
                        .body(new RangeResource(resource, start, rangeLength));
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .contentLength(contentLength)
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * A Resource that wraps another resource and only exposes a byte range.
     */
    private static class RangeResource implements Resource {
        private final Resource delegate;
        private final long start;
        private final long length;

        RangeResource(Resource delegate, long start, long length) {
            this.delegate = delegate;
            this.start = start;
            this.length = length;
        }

        @Override
        public java.io.InputStream getInputStream() throws IOException {
            java.io.InputStream in = delegate.getInputStream();
            in.skip(start);
            return new BoundedInputStream(in, length);
        }

        @Override public boolean exists() { return delegate.exists(); }
        @Override public java.net.URL getURL() throws IOException { return delegate.getURL(); }
        @Override public java.net.URI getURI() throws IOException { return delegate.getURI(); }
        @Override public java.io.File getFile() throws IOException { return delegate.getFile(); }
        @Override public long contentLength() throws IOException { return length; }
        @Override public long lastModified() throws IOException { return delegate.lastModified(); }
        @Override public Resource createRelative(String relativePath) throws IOException { return delegate.createRelative(relativePath); }
        @Override public String getFilename() { return delegate.getFilename(); }
        @Override public String getDescription() { return delegate.getDescription(); }
    }

    private static class BoundedInputStream extends java.io.InputStream {
        private final java.io.InputStream in;
        private long remaining;

        BoundedInputStream(java.io.InputStream in, long limit) {
            this.in = in;
            this.remaining = limit;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) return -1;
            int b = in.read();
            if (b != -1) remaining--;
            return b;
        }

        @Override
        public int read(byte[] buf, int off, int len) throws IOException {
            if (remaining <= 0) return -1;
            int toRead = (int) Math.min(len, remaining);
            int bytesRead = in.read(buf, off, toRead);
            if (bytesRead > 0) remaining -= bytesRead;
            return bytesRead;
        }

        @Override
        public void close() throws IOException {
            in.close();
        }
    }
}
