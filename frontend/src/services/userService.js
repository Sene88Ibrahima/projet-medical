// src/services/userService.js
import axios from '../api/auth';

const API_URL = '/api/v1/admin/users'; // adjust if another endpoint is exposed

const getById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

const getAllDoctors = async () => {
  const { data } = await axios.get('/api/v1/doctor/doctors');
  return data;
};

const userService = { getById, getAllDoctors };

export default userService;
