import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    //pido el id del usuario para listar sus tareas
    async listTasks(userId: string): Promise<Task[]> {
        const tasks = await this.tasksRepository.find({ where: { userId } });

        return tasks;
    }

    // pido el id de la tarea y el id del usuario para comprobar que el usuario tiene acceso a la tarea y no le devuelvo la tarea si no tiene acceso
    async getTask(id: string, userId: string): Promise<Task> {
        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .where(`task.id = "${id}"`)
            .andWhere('task.userId = :userId', { userId })
            .getOne();
        if (!task) {
            throw new ForbiddenException('You do not have access to this task'); // Lanza un error si no es el propietario
        }

        return task;
    }

    // pido el id de la tarea y el id del usuario. No es necesario validar aqui porque ya lo hago en getTask
    async editTask(body: any) {
        await this.tasksRepository.update(body.id, body);

        const editedTask = await this.getTask(body.id, body.userId);

        return editedTask;
    }
}
