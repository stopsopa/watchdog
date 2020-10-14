import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1602541889003 implements MigrationInterface {
    name = 'auto1602541889003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` CHANGE `project_id` `project_id` int NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `probes` CHANGE `project_id` `project_id` int NULL");
    }

}
