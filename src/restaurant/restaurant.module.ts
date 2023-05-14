import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BookingController } from './booking/booking.controller';
import { BookingService } from './booking/booking.service';
import configs from './../configs';
import { MorganMiddleware } from '@nest-middlewares/morgan';
import { InitTableMiddleware } from './../middleware/init-table.middleware';
import { StaffMiddleware } from './../middleware/staff.middleware';

@Module({
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
  controllers: [AuthController, BookingController],
  providers: [AuthService, BookingService],
  exports: [AuthService],
})
export class RestaurantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    MorganMiddleware.configure(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"',
    );
    consumer
      .apply(MorganMiddleware)
      .forRoutes('*')
      .apply(InitTableMiddleware)
      .forRoutes({ path: 'booking/table/init', method: RequestMethod.POST })
      .apply(StaffMiddleware)
      .forRoutes({ path: 'booking/table/clear', method: RequestMethod.PATCH });
  }
}
