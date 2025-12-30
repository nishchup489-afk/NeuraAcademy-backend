import axios from "axios";

// Prefer a relative base so Vercel proxy (vercel.json) can make requests
// appear same-origin. If `VITE_API_URL` is set in the environment, it
// will be used; otherwise default to relative (so baseURL => `/api`).
const BASE = import.meta?.env?.VITE_API_URL ?? ""

const api = axios.create({
    baseURL: BASE ? `${BASE}/api` : `/api`,
    withCredentials: true,
})

export default api; 

