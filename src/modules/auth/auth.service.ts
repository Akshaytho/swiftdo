import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { config } from '../../config';
import { signAccessToken, signRefreshToken, verifyToken } from '../../lib/jwt';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../lib/errors';
import { createModuleLogger } from '../../lib/logger';
import type { RegisterDto, LoginDto } from './auth.schema';

const log = createModuleLogger('auth.service');

export class AuthService {
  async register(dto: RegisterDto) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    // Check phone uniqueness if provided
    if (dto.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) {
        throw new ConflictError('A user with this phone number already exists', 'PHONE_ALREADY_EXISTS');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, config.BCRYPT_ROUNDS);

    // Create user + role-specific profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
          phone: dto.phone ?? null,
          role: dto.role,
        },
      });

      // Create role-specific profile
      if (dto.role === 'WORKER') {
        await tx.workerProfile.create({
          data: { userId: newUser.id },
        });
      } else if (dto.role === 'BUYER') {
        await tx.buyerProfile.create({
          data: { userId: newUser.id },
        });
      }

      return newUser;
    });

    log.info({ userId: user.id, role: user.role }, 'User registered');

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      // Constant-time comparison to prevent timing attacks on email enumeration
      await bcrypt.hash(dto.password, config.BCRYPT_ROUNDS);
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    log.info({ userId: user.id }, 'User logged in');

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = verifyToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    const tokens = this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workerProfile: true,
        buyerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return this.sanitizeUser(user);
  }

  private generateTokens(user: { id: string; role: string; email: string }) {
    const tokenPayload = { sub: user.id, role: user.role, email: user.email };
    return {
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
    };
  }

  private sanitizeUser(user: Record<string, unknown>) {
    const { passwordHash: _removed, ...safe } = user;
    return safe;
  }
}

export const authService = new AuthService();
