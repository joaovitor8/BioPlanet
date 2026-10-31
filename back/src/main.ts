import './config/env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Libera o site (Next) para chamar a API direto do navegador.
  app.enableCors({ origin: process.env.WEB_URL ?? 'http://localhost:3000' });

  // 3001 para não brigar com o Next, que usa a 3000.
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`API do BioPlanet em http://localhost:${port}`);
}
await bootstrap();
