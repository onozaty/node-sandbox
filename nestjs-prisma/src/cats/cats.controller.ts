import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  // curl -X POST -H "Content-Type: application/json" -d '{"name": "name1", "age": "1", "breed": "xx"}' localhost:3000/cats
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  // curl -X GET localhost:3000/cats
  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
