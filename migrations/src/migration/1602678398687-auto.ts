import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1602678398687 implements MigrationInterface {
    name = 'auto1602678398687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` ADD `password` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` DROP COLUMN `password`");
    }

}
