import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { SuggestDto } from './dto/suggest.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard) // <-- protect with token
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('suggest')
  async suggest(@Req() req: any, @Body() dto: SuggestDto) {
    const suggestions = await this.ai.suggest(dto.input);
    return { suggestions, user: req.user.sub }; // you can also log the user here
  }
}