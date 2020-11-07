import {MigrationInterface, QueryRunner} from "typeorm";

/// add `service_mode` boolean column to `probes` table
export class auto1604713985328 implements MigrationInterface {
    name = 'auto1604713985328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` ADD `service_mode` tinyint(1) NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` DROP COLUMN `service_mode`");
    }
}
