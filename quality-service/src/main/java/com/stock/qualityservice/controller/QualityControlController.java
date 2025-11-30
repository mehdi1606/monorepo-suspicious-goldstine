package com.stock.qualityservice.controller;

import com.stock.qualityservice.dto.request.QualityControlRequest;
import com.stock.qualityservice.dto.request.QualityControlUpdateRequest;
import com.stock.qualityservice.dto.response.QualityControlResponse;
import com.stock.qualityservice.service.QualityControlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/quality-controls")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Quality Control", description = "Quality Control Management APIs")
public class QualityControlController {

    private final QualityControlService qualityControlService;

    @PostMapping
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'ADMIN')")
    @Operation(summary = "Create quality control", description = "Create a new quality control inspection")
    public ResponseEntity<QualityControlResponse> createQualityControl(
            @Valid @RequestBody QualityControlRequest request) {
        log.info("Creating quality control for product: {}", request.getItemId());
        QualityControlResponse response = qualityControlService.createQualityControl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get quality control by ID")
    public ResponseEntity<QualityControlResponse> getQualityControlById(@PathVariable String id) {
        log.info("Fetching quality control with ID: {}", id);
        QualityControlResponse response = qualityControlService.getQualityControlById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get all quality controls", description = "Get paginated list of quality controls")
    public ResponseEntity<Page<QualityControlResponse>> getAllQualityControls(Pageable pageable) {
        log.info("Fetching all quality controls with pagination");
        Page<QualityControlResponse> response = qualityControlService.getAllQualityControls(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get quality controls by product ID")
    public ResponseEntity<List<QualityControlResponse>> getQualityControlsByProductId(
            @PathVariable String productId) {
        log.info("Fetching quality controls for product: {}", productId);
        List<QualityControlResponse> response = qualityControlService.getQualityControlsByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/batch/{batchNumber}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get quality controls by batch number")
    public ResponseEntity<List<QualityControlResponse>> getQualityControlsByBatchNumber(
            @PathVariable String batchNumber) {
        log.info("Fetching quality controls for batch: {}", batchNumber);
        List<QualityControlResponse> response = qualityControlService.getQualityControlsByBatchNumber(batchNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get quality controls by status")
    public ResponseEntity<Page<QualityControlResponse>> getQualityControlsByStatus(
            @PathVariable String status, Pageable pageable) {
        log.info("Fetching quality controls with status: {}", status);
        Page<QualityControlResponse> response = qualityControlService.getQualityControlsByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inspector/{inspectorId}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'ADMIN')")
    @Operation(summary = "Get quality controls by inspector")
    public ResponseEntity<List<QualityControlResponse>> getQualityControlsByInspector(
            @PathVariable String inspectorId) {
        log.info("Fetching quality controls for inspector: {}", inspectorId);
        List<QualityControlResponse> response = qualityControlService.getQualityControlsByInspector(inspectorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'ADMIN')")
    @Operation(summary = "Get quality controls by date range")
    public ResponseEntity<List<QualityControlResponse>> getQualityControlsByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        log.info("Fetching quality controls between {} and {}", startDate, endDate);
        List<QualityControlResponse> response = qualityControlService.getQualityControlsByDateRange(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'ADMIN')")
    @Operation(summary = "Update quality control")
    public ResponseEntity<QualityControlResponse> updateQualityControl(
            @PathVariable String id,
            @Valid @RequestBody QualityControlUpdateRequest request) {
        log.info("Updating quality control with ID: {}", id);
        QualityControlResponse response = qualityControlService.updateQualityControl(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'ADMIN')")
    @Operation(summary = "Update quality control status")
    public ResponseEntity<QualityControlResponse> updateQualityControlStatus(
            @PathVariable String id,
            @RequestParam String status) {
        log.info("Updating status for quality control ID {} to {}", id, status);
        QualityControlResponse response = qualityControlService.updateQualityControlStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'ADMIN')")
    @Operation(summary = "Approve quality control")
    public ResponseEntity<QualityControlResponse> approveQualityControl(@PathVariable String id) {
        log.info("Approving quality control with ID: {}", id);
        QualityControlResponse response = qualityControlService.approveQualityControl(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'ADMIN')")
    @Operation(summary = "Reject quality control")
    public ResponseEntity<QualityControlResponse> rejectQualityControl(
            @PathVariable String id,
            @RequestParam String reason) {
        log.info("Rejecting quality control with ID: {}", id);
        QualityControlResponse response = qualityControlService.rejectQualityControl(id, reason);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete quality control")
    public ResponseEntity<Void> deleteQualityControl(@PathVariable String id) {
        log.info("Deleting quality control with ID: {}", id);
        qualityControlService.deleteQualityControl(id);
        return ResponseEntity.noContent().build();
    }
}