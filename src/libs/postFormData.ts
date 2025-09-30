"use client"
import axios from 'axios';

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL
const COLLECTION_ID = process.env.NEXT_PUBLIC_POST_COLLECTION_ID || '';

export interface FormSubmissionRequest {
  data: Record<string, any>;
  token?: string;
}

export interface FormSubmissionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function postFormData(
  formData: Record<string, any>,
  token?: string,
): Promise<FormSubmissionResponse> {
  try {
    const url = `${CMS_BASE_URL}/v1/api/form/${COLLECTION_ID}`;
    
    const requestBody: FormSubmissionRequest = {
      data: formData,
      ...(token && { token })
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: 'Form submitted successfully'
    };
  } catch (error) {
    console.error('Form submission error:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}