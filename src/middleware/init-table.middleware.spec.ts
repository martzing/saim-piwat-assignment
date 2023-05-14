import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './../restaurant/auth/auth.service';
import { InitTableMiddleware } from './init-table.middleware';
import { HttpStatus } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMockReq, getMockRes } from '@jest-mock/express';
import configs from './../configs';
import { JwtModule } from '@nestjs/jwt';

describe('InitTableMiddleware', () => {
  let middleware: InitTableMiddleware;
  let authService: AuthService;
  const { res: mockRes, next, clearMockRes } = getMockRes();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configs],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '10m' },
          }),
          global: true,
        }),
      ],
      controllers: [InitTableMiddleware],
      providers: [AuthService],
    }).compile();

    middleware = module.get<InitTableMiddleware>(InitTableMiddleware);
    authService = module.get<AuthService>(AuthService);
    clearMockRes();
  });

  it('init table middleware pass', async () => {
    const { token } = await authService.login({
      username: 'admin1',
      password: '1234567890',
    });
    const mockReq = getMockReq({
      headers: {
        authorization: token,
      },
    });
    await middleware.use(mockReq, mockRes, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('init table middleware fail when authorization not found', async () => {
    const mockReq = getMockReq();
    let thrownError;
    try {
      await middleware.use(mockReq, mockRes, next);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Authorization is missing'],
      error: 'Bad Request',
    });
  });

  it('init table middleware fail when invalid jwt', async () => {
    const mockReq = getMockReq({
      headers: {
        authorization: 'invalid jwt',
      },
    });
    let thrownError;
    try {
      await middleware.use(mockReq, mockRes, next);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: ['jwt malformed'],
      error: 'Unauthorized',
    });
  });

  it('init table middleware fail when staff not found', async () => {
    const { token } = await authService.login({
      username: 'admin4',
      password: '1234567890',
    });
    authService.adminList.pop();
    const mockReq = getMockReq({
      headers: {
        authorization: token,
      },
    });
    let thrownError;
    try {
      await middleware.use(mockReq, mockRes, next);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.NOT_FOUND,
      message: ['Staff not found'],
      error: 'Not Found',
    });
  });

  it('init table middleware fail when no permission', async () => {
    const { token } = await authService.login({
      username: 'admin3',
      password: '1234567890',
    });
    const mockReq = getMockReq({
      headers: {
        authorization: token,
      },
    });
    let thrownError;
    try {
      await middleware.use(mockReq, mockRes, next);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.FORBIDDEN,
      message: ["You don't have permission to access this api"],
      error: 'Forbidden',
    });
  });
});
