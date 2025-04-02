import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Get('')
    async listTasks(@Req() req) {
        return this.tasksService.listTasks(req.user.id);
    }

    @Get('/:id')
    async getTask(@Param('id') id: string, @Req() req) {
        return this.tasksService.getTask(id, req.user.id);
    }

    @Post('/edit')
    async editTask(@Body() body, @Req() req) {
        // Verificar que el usuario autenticado es el propietario de la tarea
        await this.tasksService.getTask(body.id, req.user.id);
        // Si la validación pasa, permitir editar
        return this.tasksService.editTask({ ...body, userId: req.user.id });
    }
}
