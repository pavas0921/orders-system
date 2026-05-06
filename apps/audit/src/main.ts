import { NestFactory } from '@nestjs/core';
import { AuditModule } from './audit.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuditModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('AUDIT_PORT') ?? 3001;
  await app.listen(port);
  console.log(`Audit service running on port ${port}`)
}
bootstrap();
