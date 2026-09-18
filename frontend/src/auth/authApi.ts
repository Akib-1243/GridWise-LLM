import {api} from '../api/axios';

export type User={id:number;name:string;email:string;role:'admin'|'operator'|'viewer';created_at:string};
export type AuthResponse={token:string;user:User;message:string};

export const authApi={
  login:(payload:{username:string;password:string;remember:boolean})=>api.post<AuthResponse>('/auth/login',payload).then(response=>response.data),
  register:(payload:{name:string;email:string;password:string;password_confirmation:string})=>api.post<AuthResponse>('/auth/register',payload).then(response=>response.data),
  me:()=>api.get<{user:User}>('/auth/me').then(response=>response.data.user),
  logout:()=>api.post('/auth/logout'),
  logoutAll:()=>api.post('/auth/logout-all'),
  updateProfile:(payload:{name:string;email:string})=>api.patch<{user:User;message:string}>('/auth/profile',payload).then(response=>response.data.user),
  changePassword:(payload:{current_password:string;password:string;password_confirmation:string})=>api.post<{message:string}>('/auth/change-password',payload).then(response=>response.data),
  forgotPassword:(payload:{email:string})=>api.post<{message:string}>('/auth/forgot-password',payload).then(response=>response.data),
  resetPassword:(payload:{token:string;email:string;password:string;password_confirmation:string})=>api.post<{message:string}>('/auth/reset-password',payload).then(response=>response.data),
};
