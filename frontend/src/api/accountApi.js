import axiosClient from "./axiosClient";

export const getMyProfile = () =>
    axiosClient.get("/users/me");

export const deleteMyAccount = () =>
    axiosClient.delete("/users/me");
