/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useRole.ts

import { useAuth } from './useAuth';

interface UseRoleReturn {
  role: 'admin' | 'instructor' | 'student' | null;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  hasRole: (roles: Array<'admin' | 'instructor' | 'student'>) => boolean;
}

export const useRole = (): UseRoleReturn => {
  const { user } = useAuth();
  const role = user?.role || null;

  return {
    role,
    isAdmin: role === 'admin',
    isInstructor: role === 'instructor',
    isStudent: role === 'student',
    hasRole: (roles) => roles.includes(role as any),
  };
};