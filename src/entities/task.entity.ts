import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    done: boolean;

    @Column()
    dueDate: string;

    @ManyToOne(() => User, (user) => user.tasks)
    @JoinColumn({ name: 'userId' }) // Relacionar con la entidad User
    owner: User;

    @Column() // Columna nueva para almacenar el ID del usuario
    userId: string;
}
