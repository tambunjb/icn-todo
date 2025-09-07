import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private client: OpenAI;
  private model: string;

  constructor(cfg: ConfigService) {
    this.client = new OpenAI({ apiKey: cfg.get<string>('OPENAI_API_KEY')! });
    this.model = cfg.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  async suggest(input: string): Promise<string[]> {
    const sys = `You generate brief and practical task suggestions which is popular and useful nowadays. 
Return ONLY a JSON object: {"suggestions":["...","...","..."]}. 
No commentary, no markdown. Exactly 3 items, each <= 80 chars.`;

    try {
      const res = await this.client.responses.create({
        model: this.model,
        input: [
          { role: 'system', content: sys },
          { role: 'user', content: input.trim() }
        ],
      });

      const text = res.output_text || '';
      const json = JSON.parse(text);
      const arr: unknown = json?.suggestions;

      if (!Array.isArray(arr) || arr.length !== 3 || !arr.every(x => typeof x === 'string')) {
        throw new Error('bad shape');
      }
      return arr;
    } catch (e) {
      // Hide provider details from clients
      throw new InternalServerErrorException('AI suggestion failed: ' + e);
    }
  }
}