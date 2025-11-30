import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';
import { QualityControl, Quarantine, QualityAttachment, PaginatedResponse, PaginationParams, ApiResponse } from '@/types';

export const qualityService = {
  // Quality Controls
  getQualityControls: async (params?: PaginationParams): Promise<PaginatedResponse<QualityControl>> => {
    const response = await apiClient.get<PaginatedResponse<QualityControl>>(API_ENDPOINTS.QUALITY.QUALITY_CONTROLS, { params });
    return response.data;
  },

  getQualityControlById: async (id: string): Promise<QualityControl> => {
    const response = await apiClient.get<QualityControl>(API_ENDPOINTS.QUALITY.QUALITY_CONTROL_BY_ID(id));
    return response.data;
  },

  createQualityControl: async (data: Partial<QualityControl>): Promise<ApiResponse<QualityControl>> => {
    const response = await apiClient.post<ApiResponse<QualityControl>>(API_ENDPOINTS.QUALITY.QUALITY_CONTROLS, data);
    return response.data;
  },

  updateQualityControl: async (id: string, data: Partial<QualityControl>): Promise<ApiResponse<QualityControl>> => {
    const response = await apiClient.put<ApiResponse<QualityControl>>(API_ENDPOINTS.QUALITY.QUALITY_CONTROL_BY_ID(id), data);
    return response.data;
  },

  deleteQualityControl: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.QUALITY.QUALITY_CONTROL_BY_ID(id));
    return response.data;
  },

  approveQualityControl: async (id: string): Promise<QualityControl> => {
    const response = await apiClient.patch<QualityControl>(`${API_ENDPOINTS.QUALITY.QUALITY_CONTROLS}/${id}/approve`);
    return response.data;
  },

  rejectQualityControl: async (id: string, reason: string): Promise<QualityControl> => {
    const response = await apiClient.patch<QualityControl>(`${API_ENDPOINTS.QUALITY.QUALITY_CONTROLS}/${id}/reject`, null, {
      params: { reason }
    });
    return response.data;
  },

  updateQualityControlStatus: async (id: string, status: string): Promise<QualityControl> => {
    const response = await apiClient.patch<QualityControl>(`${API_ENDPOINTS.QUALITY.QUALITY_CONTROLS}/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Quarantine
  getQuarantines: async (params?: PaginationParams): Promise<PaginatedResponse<Quarantine>> => {
    const response = await apiClient.get<PaginatedResponse<Quarantine>>(API_ENDPOINTS.QUALITY.QUARANTINE, { params });
    return response.data;
  },

  getQuarantineById: async (id: string): Promise<Quarantine> => {
    const response = await apiClient.get<Quarantine>(API_ENDPOINTS.QUALITY.QUARANTINE_BY_ID(id));
    return response.data;
  },

  createQuarantine: async (data: Partial<Quarantine>): Promise<ApiResponse<Quarantine>> => {
    const response = await apiClient.post<ApiResponse<Quarantine>>(API_ENDPOINTS.QUALITY.QUARANTINE, data);
    return response.data;
  },

  updateQuarantine: async (id: string, data: Partial<Quarantine>): Promise<ApiResponse<Quarantine>> => {
    const response = await apiClient.put<ApiResponse<Quarantine>>(API_ENDPOINTS.QUALITY.QUARANTINE_BY_ID(id), data);
    return response.data;
  },

  deleteQuarantine: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.QUALITY.QUARANTINE_BY_ID(id));
    return response.data;
  },

  // Attachments
  getAttachments: async (params?: PaginationParams): Promise<PaginatedResponse<QualityAttachment>> => {
    const response = await apiClient.get<PaginatedResponse<QualityAttachment>>(API_ENDPOINTS.QUALITY.ATTACHMENTS, { params });
    return response.data;
  },

  getAttachmentById: async (id: string): Promise<QualityAttachment> => {
    const response = await apiClient.get<QualityAttachment>(API_ENDPOINTS.QUALITY.ATTACHMENT_BY_ID(id));
    return response.data;
  },

  getAttachmentsByQualityControl: async (qualityControlId: string): Promise<QualityAttachment[]> => {
    const response = await apiClient.get<QualityAttachment[]>(`${API_ENDPOINTS.QUALITY.ATTACHMENTS}/quality-control/${qualityControlId}`);
    return response.data;
  },

  uploadAttachment: async (file: File, qualityControlId?: string, quarantineId?: string, description?: string, attachmentType?: string): Promise<QualityAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    if (qualityControlId) formData.append('qualityControlId', qualityControlId);
    if (quarantineId) formData.append('quarantineId', quarantineId);
    if (description) formData.append('description', description);
    if (attachmentType) formData.append('attachmentType', attachmentType);

    const response = await apiClient.post<QualityAttachment>(API_ENDPOINTS.QUALITY.ATTACHMENTS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createAttachment: async (data: Partial<QualityAttachment>): Promise<ApiResponse<QualityAttachment>> => {
    const response = await apiClient.post<ApiResponse<QualityAttachment>>(API_ENDPOINTS.QUALITY.ATTACHMENTS, data);
    return response.data;
  },

  deleteAttachment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.QUALITY.ATTACHMENT_BY_ID(id));
    return response.data;
  },
};

