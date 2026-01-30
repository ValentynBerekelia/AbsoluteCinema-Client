import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5134/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here for request/response handling
axiosInstance.interceptors.request.use(
  (config) => {
    // Add any request modifications here (e.g., adding auth tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
