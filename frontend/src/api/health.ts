import {api}from'./axios';export const health=()=>api.get<{status:string}>('/health').then(r=>r.data);
