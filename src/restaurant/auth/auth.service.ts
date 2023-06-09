import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Staff, LoginData, LoginResponse } from './type';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  /**
   * Mock staff data, in real application it must store in database
   */
  public adminList: Staff[] = [
    {
      id: 1,
      username: 'admin1',
      password: '$2b$10$EE08QSCiXpkR3Vukoj6gW.zesjXWHiILWlVca1t7LO/ckRjcIBqIS', // => 1234567890
      canInit: true,
    },
    {
      id: 2,
      username: 'admin2',
      password: '$2a$08$vN4HjLkngovPHbmMIVdE0uoqbufJQoloO8RTpCM/2of0A7vhdmBSi', // => 1234567890
      canInit: true,
    },
    {
      id: 3,
      username: 'admin3',
      password: '$2a$08$vN4HjLkngovPHbmMIVdE0uoqbufJQoloO8RTpCM/2of0A7vhdmBSi', // => 1234567890
      canInit: false,
    },
    {
      id: 4,
      username: 'admin4',
      password: '$2a$08$vN4HjLkngovPHbmMIVdE0uoqbufJQoloO8RTpCM/2of0A7vhdmBSi', // => 1234567890
      canInit: false,
    },
  ];

  async login({ username, password }: LoginData): Promise<LoginResponse> {
    const admin = this.adminList.find((a) => a.username === username);
    if (!admin) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: ['Staff not found'],
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const isMatch = await compare(password, admin.password);
    if (!isMatch) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Password not match'],
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = { id: admin.id };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  getStaffById(id: number): Staff | null {
    const admin = this.adminList.find((a) => a.id === id);
    if (!admin) return null;
    return admin;
  }
}
