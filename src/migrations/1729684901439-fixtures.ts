import { fakerES as faker } from '@faker-js/faker';
import * as _ from 'lodash';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Fixtures1729684901439 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const usersToInsert = _.range(1, 30).map(() => {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            return {
                fullname: faker.person.fullName({ firstName, lastName }),
                email: faker.internet
                    .email({ firstName, lastName })
                    .toLowerCase(),
                pass: faker.internet.password(),
            };
        });

        await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into('users')
            .values(usersToInsert)
            .execute();

        const ids = await queryRunner.manager.find('users', { select: ['id'] });

        const tasksToInsert = _.range(1, 1000).map(() => ({
            title: faker.lorem.words(),
            description: faker.lorem.sentence(),
            done: faker.datatype.boolean(),
            dueDate: faker.date.future(),
            owner: ids[_.random(ids.length - 1, false)],
        }));

        await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into('tasks')
            .values(tasksToInsert)
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DELETE FROM tasks');
        await queryRunner.query('DELETE FROM users');
    }
}
