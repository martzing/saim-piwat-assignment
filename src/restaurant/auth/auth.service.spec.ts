import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configs from './../../configs';
import { HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

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
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('login success', async () => {
    const { token } = await service.login({
      username: 'admin1',
      password: '1234567890',
    });
    const jwtRegEx =
      /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/;
    expect(token).toMatch(jwtRegEx);
  });

  it('login fail when staff not found', async () => {
    let thrownError;
    try {
      await service.login({
        username: 'admin11',
        password: '1234567890',
      });
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.NOT_FOUND,
      message: ['Staff not found'],
      error: 'Not Found',
    });
  });

  it('login fail when password not match', async () => {
    let thrownError;
    try {
      await service.login({
        username: 'admin1',
        password: '9999999999',
      });
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: ['Password not match'],
      error: 'Unauthorized',
    });
  });

  it('get staff by id success', async () => {
    const staff = await service.getStaffById(1);
    expect(staff).toEqual({
      id: 1,
      username: 'admin1',
      password: '$2b$10$EE08QSCiXpkR3Vukoj6gW.zesjXWHiILWlVca1t7LO/ckRjcIBqIS',
      canInit: true,
    });
  });

  it('get staff by id not found', async () => {
    const staff = await service.getStaffById(10);
    expect(staff).toBeNull();
  });
});
