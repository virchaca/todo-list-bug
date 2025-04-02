import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Logger,
    Post,
    UseGuards,
    Get,
    Param,
} from '@nestjs/common'; // importo HttpException y HttpStatus para manejar errores
//importo useGuard para autenticacion //importo logger para gestionar logs
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard'; //importo authguard
import { CreateUserDto } from './dto/create-user.dto'; //he creado un DTO para users, lo importo

@UseGuards(AuthGuard) // aplico authguard a todas las rutas de este controlador
@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name); //instancio logger
    constructor(private readonly usersService: UsersService) {}

    @Post('/create')
    //usar el DTO al crear un nuevo usuario
    async create(@Body() body: CreateUserDto) {
        this.logger.log('Received request to create a new user');
        try {
            const { email, password, fullname } = body;

            //si no se han completado estos campos, da error
            if (!email || !password || !fullname) {
                throw new HttpException(
                    'Missing required fields: email, password, or fullname',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const existingUser = await this.usersService.findOne(body.email);
            if (existingUser) {
                throw new HttpException(
                    'A user with this email already exists',
                    HttpStatus.CONFLICT,
                );
            }

            // Si no hay dichos errores, creo y guardo el usuario
            const user = await this.usersService.create(body);
            this.logger.log(
                `User created successfully with email: ${body.email}`,
            );
            return { message: 'User created successfully', user };
        } catch (error) {
            this.logger.error(
                `Failed to create user with email: ${body.email}. Error: ${error.message}`,
                error.stack,
            );
            if (error instanceof HttpException) {
                throw error; // Si ya es un HttpException, lo dejamos igual
            }
            throw new HttpException(
                'An unexpected error occurred',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('/:email')
    async findOne(@Param('email') email: string) {
        this.logger.log(`Received request to find user with email: ${email}`);
        try {
            const user = await this.usersService.findOne(email);
            this.logger.log(`User found with email: ${email}`);
            return user;
        } catch (error) {
            this.logger.error(
                `Failed to find user with email: ${email}. Error: ${error.message}`,
                error.stack,
            );
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'An unexpected error occurred',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
