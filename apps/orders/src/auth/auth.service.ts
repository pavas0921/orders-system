import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  login(secret: string): { access_token: string } {
    const validSecret = this.config.get<string>('AUTH_SECRET');

    if (secret !== validSecret) {
      throw new UnauthorizedException('Invalid secret');
    }

    const payload = { sub: 'api-client', iat: Date.now() };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
