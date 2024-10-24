import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Get('')
    async listTasks() {
        return this.tasksService.listTasks();
    }

    @Get('/:id')
    async getTask(@Param('id') id: string) {
        return this.tasksService.getTask(id);
    }

    @Post('/edit')
    async editTask(@Body() body) {
        return this.tasksService.editTask(body);
    }
}
