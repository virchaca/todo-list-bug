import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Req,
    UseGuards,
    Logger,
} from '@nestjs/common'; //importo Req para obtener userId y useGuards para autenticacion, y NotFoundException, InternalServerErrorException para lanzar error
import { TasksService } from './tasks.service';
import { AuthGuard } from '../auth/auth.guard'; // importo authguard
import { EditTaskDto } from './dto/edit-task.dto'; //importo dto para usar en editTask

// import { IsPublic } from '../auth/is-public.decorator';
// Si quisiera que alguna ruta fuera publica, usaría el decorador IsPublic, pero considero que la seguridad es importante y es mas correcto mantener todas las rutas seguras

@UseGuards(AuthGuard) // aplico authguard a todas las rutas de este controlador
@Controller('tasks')
export class TasksController {
    private readonly logger = new Logger(TasksController.name); // Instancio Logger

    constructor(private readonly tasksService: TasksService) {}

    //esta es la forma de hacer que listasks solo la pueda ver su usuario, en el enunciado no especifica sobre esto, pero he pensado que solo pueda verlas su suario, igual que hacemos con una sola tarea, con getTask
    @Get('')
    async listTasks(@Req() req) {
        this.logger.log(
            `Received request to list tasks for user with ID: ${req.user.id}`,
        );
        try {
            const tasks = await this.tasksService.listTasks(req.user.id);

            if (!tasks || tasks.length === 0) {
                this.logger.warn(
                    `No tasks found for user with ID: ${req.user.id}`,
                );
                //si no hay tareas, se devuelve u mensaje al cliente
                return { message: 'No tasks found for this user' };
            }
            this.logger.log(
                `Successfully retrieved tasks for user with ID: ${req.user.id}`,
            );
            return tasks;
        } catch (error) {
            this.logger.error(
                `Failed to list tasks for user with ID: ${req.user.id}. Error: ${error.message}`,
                error.stack,
            );
            // Manejo genérico para errores inesperados
            throw new InternalServerErrorException(
                `An unexpected error occurred: ${error.message}`,
            );
        }
    }

    // Si quisiera que listTasks fuera publica, y que pudieran verla todos los usuarios, la configuraría así, con el decorador IsPublic, y sin pasarle el id del usuario
    // @Get('')
    // @IsPublic() // Así marcaría esta ruta como pública
    // async listTasks() {
    //     return this.tasksService.listTasks();
    // }

    // le paso el id del usuario por medio de @Req, y el id de la tarea por medio de @Param
    @Get('/:id')
    async getTask(@Param('id') id: string, @Req() req) {
        this.logger.log(
            `Received request to get task with ID: ${id} for user with ID: ${req.user.id}`,
        );
        //uso un bloque try - catch para capturar posibles errores
        try {
            const task = await this.tasksService.getTask(id, req.user.id);
            if (!task) {
                this.logger.warn(
                    `Task with ID: ${id} not found for user with ID: ${req.user.id}`,
                );
                throw new NotFoundException(`Task with ID ${id} not found`);
            }
            this.logger.log(
                `Successfully retrieved task with ID: ${id} for user with ID: ${req.user.id}`,
            );
            return task;
        } catch (error) {
            this.logger.error(
                `Failed to get task with ID: ${id} for user with ID: ${req.user.id}. Error: ${error.message}`,
                error.stack,
            );
            if (error instanceof NotFoundException) {
                throw error; // Si ya es un NotFoundException, lo reenviamos
            }
            throw new InternalServerErrorException(
                `An unexpected error occurred: ${error.message}`,
            );
        }
    }

    //Le paso el id de la tarea por medio de @Body y el id del usuario por medio de @Req
    @Post('/edit')
    async editTask(@Body() body: EditTaskDto, @Req() req) {
        this.logger.log(
            `Received request to edit task with ID: ${body.id} for user with ID: ${req.user.id}`,
        );
        //valido que el cuerpo del body tenga los datos
        try {
            // Verifico que el usuario autenticado es el propietario de la tarea
            await this.tasksService.getTask(body.id, req.user.id);
            // Si la validación pasa, permito editar
            const updatedTask = await this.tasksService.editTask({
                ...body,
                userId: req.user.id,
            });
            this.logger.log(
                `Task with ID: ${body.id} successfully updated for user with ID: ${req.user.id}`,
            );
            return updatedTask;
        } catch (error) {
            this.logger.error(
                `Failed to edit task with ID: ${body.id} for user with ID: ${req.user.id}. Error: ${error.message}`,
                error.stack,
            );
            //intanceof para comprobar el tipo de error, manejo específico para errores de tipo ForbiddenException
            if (error instanceof ForbiddenException) {
                // Si la tarea no existe o no pertenece al usuario, lanza un error 403 Forbidden
                throw new ForbiddenException(
                    'You do not have permission to edit this task',
                );
            }
            // Manej genérico para otros errores
            throw new InternalServerErrorException(
                `An unexpected error occurred: ${error.message}`,
            );
        }
    }
}
