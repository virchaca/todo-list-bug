import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common'; // importo ForbiddenException, InternalServerErrorException, BadRequestException para manejar errores y logger para logs
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name); // Instancio Logger

    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    //configuro listTasks para que solo pueda verla su usuario, aqui pido el id del usuario para listar sus tareas, pero no el id de la tarea, como en getTask, porque las listo todas.
    async listTasks(userId: string): Promise<Task[]> {
        this.logger.log(`Fetching tasks for user with ID: ${userId}`);
        try {
            const tasks = await this.tasksRepository.find({
                where: { userId },
            });
            this.logger.log(
                `Found ${tasks.length} tasks for user with ID: ${userId}`,
            );
            return tasks;
        } catch (error) {
            this.logger.error(
                `Failed to fetch tasks for user with ID: ${userId}. Error: ${error.message}`,
                error.stack,
            );
            // Manejo de errores inesperados
            throw new InternalServerErrorException(
                `An unexpected error occurred: ${error.message}`,
            );
        }
    }

    // Si quisiera que listTasks fuera publica, y que pudieran verla todos los usuarios, la configuraría así, sin pasarle el id del usuario
    // async listTasks(): Promise<Task[]> {
    //     const tasks = await this.tasksRepository.find();
    //     return tasks;
    // }

    // pido el id de la tarea y el id del usuario para comprobar que el usuario tiene acceso a la tarea y no le devuelvo la tarea si no tiene acceso
    async getTask(id: string, userId: string): Promise<Task> {
        this.logger.log(
            `Fetching task with ID: ${id} for user with ID: ${userId}`,
        );
        try {
            const task = await this.tasksRepository
                .createQueryBuilder('task')
                .where(`task.id = "${id}"`)
                .andWhere('task.userId = :userId', { userId })
                .getOne();
            if (!task) {
                this.logger.warn(
                    `Task with ID: ${id} not found for user with ID: ${userId}`,
                );
                // Si la tarea no existe o no pertenece al usuario, lanza un error 403
                throw new ForbiddenException(
                    'You do not have access to this task',
                );
            }

            this.logger.log(
                `Task with ID: ${id} retrieved successfully for user with ID: ${userId}`,
            );
            return task;
        } catch (error) {
            this.logger.error(
                `Failed to fetch task with ID: ${id} for user with ID: ${userId}. Error: ${error.message}`,
                error.stack,
            );
            // Manejo de errores inesperados
            throw new InternalServerErrorException(
                `An unexpected error occurred: ${error.message}`,
            );
        }
    }

    // pido el id de la tarea y el id del usuario. No es necesario validar aqui porque ya lo hago en getTask
    async editTask(body: any): Promise<Task> {
        this.logger.log(
            `Attempting to edit task with ID: ${body.id} for user with ID: ${body.userId}`,
        );
        try {
            //valido que el body tenga los campos necesarios para editar la tarea
            // Si no los tiene, lanzo un error 400
            if (!body.id || !body.title || !body.description) {
                this.logger.warn(
                    `Failed to edit task: Missing required fields for task with ID: ${body.id}`,
                );
                throw new BadRequestException(
                    'Missing required fields for this task',
                );
            }

            //actualizo la tarea
            await this.tasksRepository.update(body.id, body);

            const editedTask = await this.getTask(body.id, body.userId);

            this.logger.log(
                `Task with ID: ${body.id} updated successfully for user with ID: ${body.userId}`,
            );

            return editedTask;
        } catch (error) {
            this.logger.error(
                `Failed to edit task with ID: ${body.id} for user with ID: ${body.userId}. Error: ${error.message}`,
                error.stack,
            );
            // Manejo de errores inesperados
            throw new InternalServerErrorException(
                `An unexpected error occurred: ${error.message}`,
            );
        }
    }
}
