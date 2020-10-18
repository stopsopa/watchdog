import {MigrationInterface, QueryRunner} from "typeorm";

/// ALTER TABLE `projects` ADD `description` mediumtext NULL
export class auto1602982613576 implements MigrationInterface {
    name = 'auto1602982613576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `projects` ADD `description` mediumtext NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `projects` DROP COLUMN `description`");
    }

}
