import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Get()
    health() {
        return { success: true, message: 'API is running' };
    }
}
