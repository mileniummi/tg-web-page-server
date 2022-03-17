import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Post_ } from './posts.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Посты')
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @ApiOperation({ summary: 'Создание поста' })
  @ApiResponse({ status: 200, type: Post_ })
  @Post()
  create(@Body() postDto: CreatePostDto, @Request() req) {
    return this.postsService.createPost(postDto, req.user);
  }

  @ApiOperation({ summary: 'Получение всех постов' })
  @ApiResponse({ status: 200, type: [Post_] })
  @Get()
  geAll(@Request() req) {
    return this.postsService.getAllPosts(req.user);
  }
}
