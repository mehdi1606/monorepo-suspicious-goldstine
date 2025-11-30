package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.QualityControlRequest;
import com.stock.qualityservice.dto.request.QualityControlUpdateRequest;
import com.stock.qualityservice.dto.response.QualityControlResponse;
import com.stock.qualityservice.dto.response.InspectionResultResponse;
import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.entity.InspectionResult;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.exception.*;
import com.stock.qualityservice.repository.QualityControlRepository;
import com.stock.qualityservice.service.QualityControlService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QualityControlServiceImpl implements QualityControlService {

    private final QualityControlRepository qualityControlRepository;

    @Override
    public QualityControlResponse createQualityControl(QualityControlRequest request) {
        log.info("Creating quality control for item ID: {}", request.getItemId());

        List<QCStatus> activeStatuses = Arrays.asList(QCStatus.PENDING, QCStatus.IN_PROGRESS);
        if (qualityControlRepository.existsByItemIdAndLotIdAndStatusIn(
                request.getItemId(), request.getLotId(), activeStatuses)) {
            throw new DuplicateInspectionException(request.getItemId(), request.getLotId());
        }

        QualityControl inspection = mapToEntity(request);
        inspection.setInspectionNumber(generateInspectionNumber());
        QualityControl savedInspection = qualityControlRepository.save(inspection);

        log.info("Quality control created successfully with ID: {}", savedInspection.getId());
        return mapToResponse(savedInspection);
    }

    @Override
    public QualityControlResponse updateQualityControl(String id, QualityControlUpdateRequest request) {
        log.info("Updating quality control ID: {}", id);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        if (inspection.getStatus() == QCStatus.PASSED || inspection.getStatus() == QCStatus.FAILED) {
            throw new InspectionAlreadyCompletedException(id);
        }

        updateEntityFromRequest(inspection, request);
        QualityControl updatedInspection = qualityControlRepository.save(inspection);

        log.info("Quality control updated successfully: {}", id);
        return mapToResponse(updatedInspection);
    }

    @Override
    @Transactional(readOnly = true)
    public QualityControlResponse getQualityControlById(String id) {
        log.info("Fetching quality control by ID: {}", id);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        return mapToResponse(inspection);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QualityControlResponse> getAllQualityControls(Pageable pageable) {
        log.info("Fetching all quality controls with pagination");
        return qualityControlRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getQualityControlsByProductId(String productId) {
        log.info("Fetching quality controls for product ID: {}", productId);
        return qualityControlRepository.findByItemId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getQualityControlsByBatchNumber(String batchNumber) {
        log.info("Fetching quality controls for batch number: {}", batchNumber);
        return qualityControlRepository.findByLotId(batchNumber).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QualityControlResponse> getQualityControlsByStatus(String status, Pageable pageable) {
        log.info("Fetching quality controls by status: {}", status);
        QCStatus qcStatus = QCStatus.valueOf(status.toUpperCase());
        return qualityControlRepository.findByStatus(qcStatus, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getQualityControlsByInspector(String inspectorId) {
        log.info("Fetching quality controls for inspector ID: {}", inspectorId);
        return qualityControlRepository.findByInspectorId(inspectorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getQualityControlsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching quality controls between {} and {}", startDate, endDate);
        return qualityControlRepository.findByCreatedAtBetween(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QualityControlResponse updateQualityControlStatus(String id, String status) {
        log.info("Updating status for quality control ID {} to {}", id, status);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        QCStatus newStatus = QCStatus.valueOf(status.toUpperCase());
        inspection.setStatus(newStatus);

        QualityControl updatedInspection = qualityControlRepository.save(inspection);
        log.info("Quality control status updated successfully: {}", id);

        return mapToResponse(updatedInspection);
    }

    @Override
    public QualityControlResponse approveQualityControl(String id) {
        log.info("Approving quality control ID: {}", id);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        if (inspection.getStatus() != QCStatus.PASSED && inspection.getStatus() != QCStatus.FAILED) {
            throw new InvalidInspectionStateException(id, inspection.getStatus(), "approve");
        }

        inspection.setApprovedBy("SYSTEM"); // TODO: Get from security context
        inspection.setApprovedAt(LocalDateTime.now());
        inspection.setDisposition(Disposition.ACCEPT);

        QualityControl approvedInspection = qualityControlRepository.save(inspection);
        log.info("Quality control approved successfully: {}", id);

        return mapToResponse(approvedInspection);
    }

    @Override
    public QualityControlResponse rejectQualityControl(String id, String reason) {
        log.info("Rejecting quality control ID: {} with reason: {}", id, reason);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        inspection.setStatus(QCStatus.FAILED);
        inspection.setDisposition(Disposition.REJECT);
        inspection.setInspectorNotes(reason);
        inspection.setApprovedBy("SYSTEM"); // TODO: Get from security context
        inspection.setApprovedAt(LocalDateTime.now());

        QualityControl rejectedInspection = qualityControlRepository.save(inspection);
        log.info("Quality control rejected successfully: {}", id);

        return mapToResponse(rejectedInspection);
    }

    @Override
    public void deleteQualityControl(String id) {
        log.info("Deleting quality control ID: {}", id);

        if (!qualityControlRepository.existsById(id)) {
            throw new InspectionNotFoundException(id);
        }

        qualityControlRepository.deleteById(id);
        log.info("Quality control deleted successfully: {}", id);
    }

    // Helper methods
    private String generateInspectionNumber() {
        return "INS-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private QualityControl mapToEntity(QualityControlRequest request) {
        QualityControl inspection = new QualityControl();
        inspection.setItemId(request.getItemId());
        inspection.setLotId(request.getLotId());
        inspection.setSerialNumber(request.getSerialNumber());
        inspection.setQuantityInspected(request.getQuantityInspected());
        inspection.setInspectionType(request.getInspectionType());
        inspection.setStatus(QCStatus.PENDING);
        inspection.setQualityProfileId(request.getQualityProfileId());
        inspection.setSamplingPlanId(request.getSamplingPlanId());
        inspection.setInspectorId(request.getInspectorId());
        inspection.setInspectionLocationId(request.getInspectionLocationId());
        inspection.setScheduledDate(request.getScheduledDate());
        inspection.setQuarantineId(request.getQuarantineId());
        return inspection;
    }

    private void updateEntityFromRequest(QualityControl inspection, QualityControlUpdateRequest request) {
        if (request.getInspectionType() != null) {
            // Convert string to enum if needed
        }
        if (request.getStatus() != null) {
            inspection.setStatus(QCStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getDefectCount() != null) {
            inspection.setDefectCount(request.getDefectCount());
        }
        if (request.getDefectDescription() != null) {
            inspection.setInspectorNotes(request.getDefectDescription());
        }
        if (request.getCorrectiveActions() != null) {
            inspection.setCorrectiveAction(request.getCorrectiveActions());
        }
        if (request.getNotes() != null) {
            inspection.setInspectorNotes(request.getNotes());
        }
    }

    private QualityControlResponse mapToResponse(QualityControl inspection) {
        QualityControlResponse response = new QualityControlResponse();
        response.setId(inspection.getId());
        response.setInspectionNumber(inspection.getInspectionNumber());
        response.setControlNumber(inspection.getInspectionNumber());  // Frontend compatibility
        response.setItemId(inspection.getItemId());
        response.setLotId(inspection.getLotId());
        response.setSerialNumber(inspection.getSerialNumber());
        response.setQuantityInspected(inspection.getQuantityInspected());
        response.setInspectionType(inspection.getInspectionType());
        response.setStatus(inspection.getStatus());
        response.setQualityProfileId(inspection.getQualityProfileId());
        response.setSamplingPlanId(inspection.getSamplingPlanId());
        response.setInspectorId(inspection.getInspectorId());
        response.setInspectionLocationId(inspection.getInspectionLocationId());
        response.setScheduledDate(inspection.getScheduledDate());
        response.setStartTime(inspection.getStartTime());
        response.setEndTime(inspection.getEndTime());
        response.setDisposition(inspection.getDisposition());
        response.setPassedQuantity(inspection.getPassedQuantity());
        response.setFailedQuantity(inspection.getFailedQuantity());
        response.setDefectCount(inspection.getDefectCount());
        response.setDefectRate(inspection.getDefectRate());
        response.setInspectorNotes(inspection.getInspectorNotes());
        response.setCorrectiveAction(inspection.getCorrectiveAction());
        response.setQuarantineId(inspection.getQuarantineId());
        response.setApprovedBy(inspection.getApprovedBy());
        response.setApprovedAt(inspection.getApprovedAt());
        response.setCreatedAt(inspection.getCreatedAt());
        response.setUpdatedAt(inspection.getUpdatedAt());
        response.setCreatedBy(inspection.getCreatedBy());
        response.setUpdatedBy(inspection.getUpdatedBy());

        if (inspection.getInspectionResults() != null && !inspection.getInspectionResults().isEmpty()) {
            List<InspectionResultResponse> resultResponses = inspection.getInspectionResults().stream()
                    .map(this::mapResultToResponse)
                    .collect(Collectors.toList());
            response.setInspectionResults(resultResponses);
        }

        return response;
    }

    private InspectionResultResponse mapResultToResponse(InspectionResult result) {
        InspectionResultResponse response = new InspectionResultResponse();
        response.setId(result.getId());
        response.setQualityControlId(result.getQualityControl().getId());
        response.setTestParameter(result.getTestParameter());
        response.setExpectedValue(result.getExpectedValue());
        response.setActualValue(result.getActualValue());
        response.setUnitOfMeasure(result.getUnitOfMeasure());
        response.setMinValue(result.getMinValue());
        response.setMaxValue(result.getMaxValue());
        response.setIsPassed(result.getIsPassed());
        response.setDefectType(result.getDefectType());
        response.setDefectSeverity(result.getDefectSeverity());
        response.setRemarks(result.getRemarks());
        response.setSequenceOrder(result.getSequenceOrder());
        response.setCreatedAt(result.getCreatedAt());
        return response;
    }
}