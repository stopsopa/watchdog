import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1602518260722 implements MigrationInterface {
    name = 'auto1602518260722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `probes` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `description` mediumtext NULL, `type` varchar(10) NOT NULL, `code` mediumtext NULL, `enabled` tinyint(1) NOT NULL DEFAULT 0, `interval_ms` int NOT NULL, `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` datetime NULL ON UPDATE CURRENT_TIMESTAMP, `project_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `probes` ADD CONSTRAINT `FK_a17ab72f48c89fd16039aeb39e9` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query("ALTER TABLE `probes` DROP FOREIGN KEY `FK_a17ab72f48c89fd16039aeb39e9`");
        await queryRunner.query("DROP TABLE `probes`");
    }

}
