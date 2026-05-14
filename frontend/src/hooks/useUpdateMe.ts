import { useMutation } from '@tanstack/react-query';
import { updateMe } from '../api/userApi';
import { useAuthStore } from '../stores/authStore';
import type { UpdateUserRequest } from '../types/user.types';

export function useUpdateMe() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateMe(data),
    onSuccess: (data) => {
      // 이름이 변경된 경우 스토어 업데이트
      if (data.name) {
        setUser({ name: data.name });
      }
    },
  });
}
