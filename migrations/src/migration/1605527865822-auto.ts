import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1605527865822 implements MigrationInterface {
    name = 'auto1605527865822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `firstName` varchar(50) NOT NULL COMMENT 'firstName', `lastName` varchar(50) NOT NULL COMMENT 'firstName', `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `enabled` tinyint(1) NOT NULL DEFAULT 0, `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` datetime NULL ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
    }

}
