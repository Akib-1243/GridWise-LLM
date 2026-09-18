import axios from 'axios';
import {getToken} from '../auth/AuthProvider';
export const api=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL??'http://localhost:8000',timeout:30000,headers:{'Content-Type':'application/json',Accept:'application/json'}});
api.interceptors.request.use(config=>{const token=getToken();if(token)config.headers.Authorization=`Bearer ${token}`;return config});
