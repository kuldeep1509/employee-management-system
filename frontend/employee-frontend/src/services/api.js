// src/services/api.js
import axios from 'axios';

// Automatically switch between local dev and deployed backend
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEmployees = (params) => api.get('employees/', { params });
export const getEmployeeDetails = (id) => api.get(`employees/${id}/`);
export const addEmployee = (data) => api.post('employees/', data);
export const updateEmployee = (id, data) => api.put(`employees/${id}/`, data);
export const deleteEmployee = (id) => api.delete(`employees/${id}/`);

export const getTasks = (params) => api.get('tasks/', { params });
export const getTaskDetails = (id) => api.get(`tasks/${id}/`);
export const addTask = (data) => api.post('tasks/', data);
export const updateTask = (id, data) => api.put(`tasks/${id}/`, data);
export const deleteTask = (id) => api.delete(`tasks/${id}/`);

export const getTaskStatuses = () => api.get('task-statuses/');
export const getUsers = () => api.get('users/'); // To fetch users for 'assigned_by'

export default api;
