import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosApi from '@/axiosApi';

export const pdfViewThunks = createAsyncThunk(
  'pdfView/pdfViewThunks',
  async (id: number) => {
    const {data: pdfFile} = await axiosApi.get(`/files/${id}/download`, {
      responseType: 'blob' as const,
    });
    return pdfFile;
  });