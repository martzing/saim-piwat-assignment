import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { LoginResponse, Staff } from './type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/staff/login')
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(body);
  }
}
