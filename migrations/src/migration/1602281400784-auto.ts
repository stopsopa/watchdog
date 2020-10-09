import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1602281400784 implements MigrationInterface {
    name = 'auto1602281400784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `projects` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL COMMENT 'name', `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` datetime NULL ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `projects`");
    }

}
