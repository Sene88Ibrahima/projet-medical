// src/services/articleService.js
import axios from '../api/auth';

const API_URL = '/api/v1/articles';

const getAll = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

const getById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

const like = async (id) => {
  const { data } = await axios.post(`${API_URL}/${id}/like`);
  return data; // expected to return new like count
};

const share = async (id, doctorIds) => {
  await axios.post(`${API_URL}/${id}/share`, { doctorIds });
};

const create = async (formData) => {
  const { data } = await axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const articleService = {
  getAll,
  getById,
  create,
  like,
  share,
};

export default articleService;
