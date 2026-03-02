import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.29.218:8000/api/v1", // Docker backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;