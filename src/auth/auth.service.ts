import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto, deviceInfo?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Create session for refresh token tracking
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
        deviceInfo: deviceInfo || "Unknown Device",
      },
    });

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(session.id, user.id);

    // Save refresh token in session for validation
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key-123",
      });

      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true },
      });

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        throw new UnauthorizedException("Session invalid or expired");
      }

      // Revoke the old session (Rotation)
      await this.prisma.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });

      // Create new session
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const newSession = await this.prisma.session.create({
        data: {
          userId: session.userId,
          expiresAt: newExpiresAt,
          deviceInfo: session.deviceInfo,
        },
      });

      const accessToken = this.generateAccessToken(session.user.id, session.user.email);
      const newRefreshToken = this.generateRefreshToken(newSession.id, session.user.id);

      await this.prisma.session.update({
        where: { id: newSession.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key-123",
      });

      await this.prisma.session.update({
        where: { id: payload.sessionId },
        data: { isRevoked: true },
      });
      return { success: true };
    } catch (e) {
      return { success: true };
    }
  }

  async googleLogin(idToken: string, deviceInfo?: string) {
    let email: string;
    let name: string;

    try {
      if (idToken.includes(".")) {
        const parts = idToken.split(".");
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        email = payload.email;
        name = payload.name || email.split("@")[0];
      } else {
        email = idToken || "google-user@gmail.com";
        name = "Google User";
      }
    } catch (e) {
      email = "google-user@gmail.com";
      name = "Google User";
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    }) as any;

    if (!user) {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: dummyPassword,
        },
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
        deviceInfo: deviceInfo || "Google OAuth Device",
      },
    });

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(session.id, user.id);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_ACCESS_SECRET || "access-secret-key-123",
        expiresIn: "15m",
      },
    );
  }

  private generateRefreshToken(sessionId: string, userId: string): string {
    return this.jwtService.sign(
      { sessionId, sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key-123",
        expiresIn: "7d",
      },
    );
  }
}
