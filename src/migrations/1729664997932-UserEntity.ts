import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEntity1729664997932 implements MigrationInterface {
    name = 'UserEntity1729664997932';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "fullname" varchar NOT NULL, "email" varchar NOT NULL, "pass" varchar NOT NULL)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
