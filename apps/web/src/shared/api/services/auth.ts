import { apiClient } from '../client';
import { LoginRequestDto, LoginResponseDto } from '../dto/auth.dto';

export const AuthService = {
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    throw new Error('Not implemented: AuthService.login');
    // const response = await apiClient.post<LoginResponseDto>('/auth/login', data);
    // return response.data;
  },

  async logout(): Promise<void> {
    throw new Error('Not implemented: AuthService.logout');
    // await apiClient.post('/auth/logout');
  },
};
