import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common'; // importo BadRequestException, NotFoundException,InternalServerErrorException para manejar errores
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(body: any) {
        try {
            // Valido que el cuerpo de la solicitud tenga los campos necesarios
            if (!body.email || !body.password || !body.fullname) {
                this.logger.warn(
                    `Failed to create user: Missing required fields for email: ${body.email}`,
                );
                throw new BadRequestException(
                    'Missing required fields: email, password, or fullname',
                );
            }

            // Verifico si el correo electrónico ya existe para evitar duplicados
            const existingUser = await this.usersRepository.findOneBy({
                email: body.email,
            });
            if (existingUser) {
                throw new BadRequestException(
                    'A user with this email already exists',
                );
            }

            //Si no hay dichos errores, creo y guardo el usuario
            const user = new User();
            user.email = body.email;
            user.pass = body.password;
            user.fullname = body.fullname;

            await this.usersRepository.save(user);
            // Log de éxito
            this.logger.log(
                `User created successfully with email: ${body.email}`,
            );

            return user;
        } catch (error) {
            // Log de error inesperado
            this.logger.error(
                `Failed to create user with email: ${body.email}. Error: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                'An unexpected error occurred while creating the user',
            );
        }
    }

    async findOne(email: string) {
        try {
            // Log de inicio de la operación
            this.logger.log(`Attempting to find user with email: ${email}`);
            const user = await this.usersRepository.findOneBy({
                email,
            });
            //lanzo error si el usuario no existe
            if (!user) {
                this.logger.warn(`User not found with email: ${email}`);
                throw new NotFoundException('User not found');
            }
            // Log de éxito
            this.logger.log(`User found with email: ${email}`);
            return user;
        } catch (error) {
            // Log de error inesperado
            this.logger.error(
                `Failed to find user with email: ${email}. Error: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                'An unexpected error occurred while retrieving the user',
            );
        }
    }
}
