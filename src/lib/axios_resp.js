import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/',
});

export const axiosInstanceSofactia = axios.create({
  baseURL: window.SOFACTIA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const fileHeader = {
  'Content-Type': 'multipart/form-data',
};

export default axiosInstance;

