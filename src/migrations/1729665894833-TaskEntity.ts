import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskEntity1729665894833 implements MigrationInterface {
    name = 'TaskEntity1729665894833';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "tasks" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "description" varchar NOT NULL, "done" boolean NOT NULL, "dueDate" varchar NOT NULL, "ownerId" varchar, CONSTRAINT "FK_a132ba8200c3abdc271d4a701d8" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tasks"`);
    }
}
