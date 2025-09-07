import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, TodosModule, AiModule],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}