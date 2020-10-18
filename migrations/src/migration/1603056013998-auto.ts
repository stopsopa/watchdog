import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1603056013998 implements MigrationInterface {
    name = 'auto1603056013998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` ADD `detailed_log` tinyint(1) NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` DROP COLUMN `detailed_log`");
    }

}
