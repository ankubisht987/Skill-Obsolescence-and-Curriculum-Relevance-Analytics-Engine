import axios from "axios";

const pythonApi = axios.create({
    baseURL: "http://localhost:8000/api",
});

pythonApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("se_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default pythonApi;