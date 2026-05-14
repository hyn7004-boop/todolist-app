import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMe } from '../api/userApi';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export function useDeleteMe() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}
