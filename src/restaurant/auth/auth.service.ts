import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Admin, LoginData, LoginResponse } from './type';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private readonly adminList: Admin[] = [
    {
      id: 1,
      username: 'admin1',
      password: '$2b$10$EE08QSCiXpkR3Vukoj6gW.zesjXWHiILWlVca1t7LO/ckRjcIBqIS', // => 1234567890
    },
    {
      id: 2,
      username: 'admin2',
      password: '$2a$08$vN4HjLkngovPHbmMIVdE0uoqbufJQoloO8RTpCM/2of0A7vhdmBSi', // => 1234567890
    },
  ];

  async login({ username, password }: LoginData): Promise<LoginResponse> {
    const admin = this.adminList.find((a) => a.username === username);
    if (!admin)
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: ['user not found'],
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    const isMatch = await compare(password, admin.password);
    if (!isMatch)
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['password not match'],
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    const payload = { id: admin.id };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
