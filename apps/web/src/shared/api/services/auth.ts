import { apiClient } from '../client';
import type { LoginRequestDto, LoginResponseDto, RegisterRequestDto } from '../dto/auth.dto';

export const AuthService = {
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequestDto): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/auth/refresh');
    return response.data;
  },

  async getMe(): Promise<LoginResponseDto['user']> {
    const response = await apiClient.get<LoginResponseDto['user']>('/auth/me');
    return response.data;
  },
};
