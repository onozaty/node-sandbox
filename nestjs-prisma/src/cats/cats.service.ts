import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

  async create(cat: Cat): Promise<Cat> {
    return await this.prisma.cat.create({ data: cat });
  }

  async findAll(): Promise<Cat[]> {
    return await this.prisma.cat.findMany();
  }
}
