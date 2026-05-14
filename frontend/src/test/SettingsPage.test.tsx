import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../pages/SettingsPage';
import { useAuthStore } from '../stores/authStore';
import { useUpdateMe } from '../hooks/useUpdateMe';
import { useDeleteMe } from '../hooks/useDeleteMe';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../hooks/useUpdateMe', () => ({
  useUpdateMe: vi.fn(),
}));

vi.mock('../hooks/useDeleteMe', () => ({
  useDeleteMe: vi.fn(),
}));

describe('SettingsPage', () => {
  const mockUser = {
    user_id: 'user-1',
    email: 'test@example.com',
    name: '홍길동',
  };

  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        user: mockUser,
      })
    );
    (useUpdateMe as any).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });
    (useDeleteMe as any).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });
  });

  it('renders current user name', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();
  });

  it('calls update mutation when name is changed', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    const nameInput = screen.getByLabelText('이름');
    fireEvent.change(nameInput, { target: { value: '김철수' } });
    
    // "변경 사항 저장" 버튼 (이름 변경 섹션의 버튼)
    const saveBtn = screen.getByRole('button', { name: '이름 변경' });
    fireEvent.click(saveBtn);

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      { name: '김철수' },
      expect.anything()
    );
  });

  it('calls update mutation with passwords when changing password', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'oldPass123!' } });
    fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'newPass123!' } });
    
    const changePwdBtn = screen.getByRole('button', { name: '비밀번호 변경' });
    fireEvent.click(changePwdBtn);

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      { current_password: 'oldPass123!', new_password: 'newPass123!' },
      expect.anything()
    );
  });

  it('shows withdrawal confirmation modal and calls delete mutation', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    
    const withdrawBtn = screen.getByRole('button', { name: '회원 탈퇴' });
    fireEvent.click(withdrawBtn);

    // Modal check
    expect(screen.getByText(/정말 탈퇴하시겠습니까/)).toBeInTheDocument();
    
    const confirmBtn = screen.getByRole('button', { name: '탈퇴 확인' });
    fireEvent.click(confirmBtn);

    expect(mockDeleteMutate).toHaveBeenCalled();
  });
});
