import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1606080818008 implements MigrationInterface {
    name = 'auto1606080818008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `password`");
        await queryRunner.query("ALTER TABLE `users` ADD `password` mediumtext NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `password`");
        await queryRunner.query("ALTER TABLE `users` ADD `password` varchar(255) NOT NULL");
    }
}
