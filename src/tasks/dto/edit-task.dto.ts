import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EditTaskDto {
    @IsString()
    id: string; // Se necesita el ID para identificar qué tarea editar

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    done?: boolean;

    @IsOptional()
    @IsString()
    dueDate?: string;
}
