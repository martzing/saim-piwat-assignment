import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/restaurant/auth/auth.service';

@Injectable()
export class InitTableMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.get('authorization') || req.get('Authorization');
    if (!authorization) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Authorization is missing'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = authorization.replace('Bearer ', '');
    const secret = this.configService.get<string>('JWT_SECRET');
    let id;
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });
      id = payload.id;
    } catch (err) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: [err.message],
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const admin = this.authService.getAdminById(id);
      if (!admin) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: ['User not found'],
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (!admin.canInit) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: ["You don't have permission to access this api"],
            error: 'Forbidden',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      req['admin'] = admin;
    } catch (err) {
      throw err;
    }
    next();
  }
}
