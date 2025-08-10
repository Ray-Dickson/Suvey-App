
import API from './api';

export const getUserSurveys = async (userId) => {
  const res = await API.get(`/surveys/user/${userId}`);
  return res.data;
};
