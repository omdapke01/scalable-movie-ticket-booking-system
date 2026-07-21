import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Enable Cookie Parsing
  app.use(cookieParser());

  // Enable CORS with Credentials
  app.enableCors({
    origin: true, // Echoes back request origin, required for credentials:true
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
