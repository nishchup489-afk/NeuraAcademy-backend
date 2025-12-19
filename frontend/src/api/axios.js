import axios from "axios";

const api = axios.create(
    {
        baseURL : "http://localhost:5000/api" ,  // TODO: import.meta.env.VITE_API_URL in production
        headers : {
            "Content-Type" : "application/json"
        },
        withCredentials: true
    }
)

export default api; 

