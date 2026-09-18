import {api} from './axios';import type{Request,Result}from'../types';export const optimize=(p:Request)=>api.post<Result>('/optimize-energy',p).then(r=>r.data);
