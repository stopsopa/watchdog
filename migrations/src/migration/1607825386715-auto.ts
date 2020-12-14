import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1607825386715 implements MigrationInterface {
    name = 'auto1607825386715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `config` mediumtext NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `config`");
    }
}
