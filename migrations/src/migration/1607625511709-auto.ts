import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1607625511709 implements MigrationInterface {
    name = 'auto1607625511709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `group` ADD `description` mediumtext NULL");
        await queryRunner.query("ALTER TABLE `users` ADD `description` mediumtext NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `description`");
        await queryRunner.query("ALTER TABLE `group` DROP COLUMN `description`");
    }

}
