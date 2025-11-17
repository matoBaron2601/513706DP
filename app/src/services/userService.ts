// src/services/userService.ts
import type { CreateUserDto, UpdateUserDto, UserDto } from '../db/schema';
import { UserRepository } from '../repositories/userRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class UserService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  async getById(userId: string, tx?: Transaction): Promise<UserDto> {
    const u = await this.repo.getById(userId, tx);
    if (!u) throw new NotFoundError(`User with id ${userId} not found`);
    return u;
  }
  async getByEmail(email: string, tx?: Transaction): Promise<UserDto> {
    const u = await this.repo.getByEmail(email, tx);
    if (!u) throw new NotFoundError(`User with email ${email} not found`);
    return u;
  }
  async create(newUser: CreateUserDto, tx?: Transaction): Promise<UserDto> {
    return this.repo.create(newUser, tx);
  }
  async update(id: string, patch: UpdateUserDto, tx?: Transaction): Promise<UserDto> {
    const u = await this.repo.update(id, patch, tx);
    if (!u) throw new NotFoundError(`User with id ${id} not found`);
    return u;
  }
  async delete(id: string, tx?: Transaction): Promise<UserDto> {
    const u = await this.repo.delete(id, tx);
    if (!u) throw new NotFoundError(`User with id ${id} not found`);
    return u;
  }
  async getByIds(ids: string[], tx?: Transaction): Promise<UserDto[]> {
    return this.repo.getByIds(ids, tx);
  }
  async getOrCreateUser(data: CreateUserDto): Promise<UserDto> {
    try {
      const existing = await this.repo.getByEmail(data.email);
      if (!existing) return this.repo.create(data);
      return existing;
    } catch (e) {
      if (e instanceof NotFoundError) return this.repo.create(data);
      return this.repo.create(data);
    }
  }
}
