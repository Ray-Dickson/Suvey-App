import API from './api';

// Admin API functions
export const getAdminStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};

export const getAllSurveysForAdmin = async () => {
  const response = await API.get('/admin/surveys');
  return response.data;
};

export const getAllUsersForAdmin = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export default {
  getAdminStats,
  getAllSurveysForAdmin,
  getAllUsersForAdmin
};
