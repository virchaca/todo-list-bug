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

    @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
    // si un usuario es eliminado, que sus tareas tambien lo sean
    @JoinColumn({ name: 'userId' }) // Relacionar con la entidad User
    owner: User;
}
