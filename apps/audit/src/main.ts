import { NestFactory } from '@nestjs/core';
import { AuditModule } from './audit.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuditModule);
  const config = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: config.get<number>('AUDIT_TCP_PORT'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.get<number>('AUDIT_PORT') ?? 3001);
  console.log(`Audit service running on port ${config.get('AUDIT_PORT')}`);
}
bootstrap();
