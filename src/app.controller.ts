import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return { status: 'v1.0', message: 'CI/CD works!' };
  }
}
