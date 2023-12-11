import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async authentication(id: string): Promise<string> {
    try {
      return await this.jwtService.signAsync({ id: id });
    } catch (error) {
      return error;
    }
  }
}
