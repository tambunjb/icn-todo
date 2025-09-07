import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(process.env.PORT || 3333);
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bootstrap();
}

export default bootstrap;