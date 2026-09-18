import {Navigate,useLocation} from 'react-router-dom';
import type {PropsWithChildren} from 'react';
import {useAuth} from './AuthProvider';
export function ProtectedRoute({children}:PropsWithChildren){const{user,loading}=useAuth();const location=useLocation();if(loading)return <div className="grid min-h-screen place-items-center"><p className="muted">Loading secure session…</p></div>;return user?<>{children}</>:<Navigate to="/login" replace state={{from:location.pathname}}/>;}
