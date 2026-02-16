import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true // Enable sending cookies with requests
});

export default apiClient;