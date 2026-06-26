import axios from "axios";

const javaApi = axios.create({
    baseURL: "http://localhost:8080/api",
});

javaApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("se_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default javaApi;