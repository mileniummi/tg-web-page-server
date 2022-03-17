import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [UsersModule, PostsModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
