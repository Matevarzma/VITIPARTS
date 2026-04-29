import axios from "axios";
import { getAdminRequestConfig } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getCars = async () => {
  const response = await api.get("/cars");
  return response.data;
};

export const getBrands = async () => {
  const response = await api.get("/brands");
  return response.data;
};

export const getBrandById = async (id) => {
  const response = await api.get(`/brands/${id}`);
  return response.data;
};

export const getCarsByBrandId = async (id) => {
  const response = await api.get(`/brands/${id}/cars`);
  return response.data;
};

export const createBrand = async (brandData) => {
  const response = await api.post(
    "/brands",
    brandData,
    getAdminRequestConfig()
  );
  return response.data;
};

export const deleteBrandById = async (id) => {
  const response = await api.delete(`/brands/${id}`, getAdminRequestConfig());
  return response.data;
};

export const createCar = async (carData) => {
  const response = await api.post("/cars", carData, getAdminRequestConfig());
  return response.data;
};

export const loginAdmin = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const getCarById = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

export const deleteCarById = async (id) => {
  const response = await api.delete(`/cars/${id}`, getAdminRequestConfig());
  return response.data;
};

export const getPartsByCarId = async (id) => {
  const response = await api.get(`/cars/${id}/parts`);
  return response.data;
};

export const createPartForCar = async (id, partData) => {
  const response = await api.post(
    `/cars/${id}/parts`,
    partData,
    getAdminRequestConfig()
  );
  return response.data;
};

export const deletePartById = async (id) => {
  const response = await api.delete(`/parts/${id}`, getAdminRequestConfig());
  return response.data;
};

export const getAdminSession = async () => {
  const response = await api.get("/auth/me", getAdminRequestConfig());
  return response.data;
};

export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong."
) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const isUnauthorizedError = (error) =>
  axios.isAxiosError(error) && error.response?.status === 401;

export default api;
