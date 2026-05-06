import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('ORDERS_PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
