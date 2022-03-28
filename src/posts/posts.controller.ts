import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Post_ } from './posts.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Посты')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @ApiOperation({ summary: 'Создание поста' })
  @ApiResponse({ status: 200, type: Post_ })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() postDto: CreatePostDto, @Request() req) {
    return this.postsService.createPost(postDto, req.user);
  }

  @ApiOperation({ summary: 'Получение всех постов конкретного пользователя' })
  @ApiResponse({ status: 200, type: [Post_] })
  @Get()
  @UseGuards(JwtAuthGuard)
  geAll(@Request() req) {
    return this.postsService.getAllPosts(req.user);
  }

  @ApiOperation({
    summary:
      'Получение всех постов конкретного пользователя по id в телеграмме',
  })
  @ApiResponse({ status: 200, type: [Post_] })
  @Get('/:id')
  getAllPostsByTgId(@Param('id') id: number) {
    return this.postsService.getAllPostsByTgId(id);
  }
}
