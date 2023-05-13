import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MorganMiddleware } from '@nest-middlewares/morgan';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import configs from 'src/configs';
import { ConfigModule } from '@nestjs/config';
import { InitTableMiddleware } from './middleware/init-table.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configs],
    }),
    RestaurantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    MorganMiddleware.configure(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"',
    );
    consumer
      .apply(MorganMiddleware)
      .forRoutes('*')
      .apply(InitTableMiddleware)
      .forRoutes({ path: 'booking/table/init', method: RequestMethod.POST });
  }
}
