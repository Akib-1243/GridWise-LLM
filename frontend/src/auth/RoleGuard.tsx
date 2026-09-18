import type {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import type {User} from './authApi';
import {useAuth} from './AuthProvider';

type RoleGuardProps={
  allowed: User['role'][];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGuard({allowed,children,fallback}: RoleGuardProps){
  const {user}=useAuth();

  if(!user){
    return <Navigate to="/login" replace />;
  }

  if(!allowed.includes(user.role)){
    return <>{fallback ?? <Navigate to="/" replace />}</>;
  }

  return <>{children}</>;
}
