import axiosInstance from '../api/auth';

export const saveMedicalInfo = async (medicalData) => {
  const response = await axiosInstance.post('/api/v1/patient/medical-info', medicalData);
  return response.data;
};
