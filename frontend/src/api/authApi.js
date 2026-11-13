import axiosClient from "./axiosClient.js";

export const login = (email, password) =>
    axiosClient.post("/auth/login", { email, password });

export const register = (name, email, password) =>
    axiosClient.post("/auth/register", { name, email, password });