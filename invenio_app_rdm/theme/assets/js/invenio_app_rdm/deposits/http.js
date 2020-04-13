import axios from "axios";

const apiConfig = {
  baseURL: "",
  withCredentials: true,
};

const http = axios.create(apiConfig);

export { http };
