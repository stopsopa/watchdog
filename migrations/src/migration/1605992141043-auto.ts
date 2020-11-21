import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1605992141043 implements MigrationInterface {
    name = 'auto1605992141043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `group` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` datetime NULL ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_group` (`user_id` int NOT NULL, `group_id` int NOT NULL, INDEX `IDX_7ded8f984bbc2ee6ff0beee491` (`user_id`), INDEX `IDX_bb9982562cca83afb76c0ddc0d` (`group_id`), PRIMARY KEY (`user_id`, `group_id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_group` ADD CONSTRAINT `FK_7ded8f984bbc2ee6ff0beee491b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_group` ADD CONSTRAINT `FK_bb9982562cca83afb76c0ddc0d6` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_group` DROP FOREIGN KEY `FK_bb9982562cca83afb76c0ddc0d6`");
        await queryRunner.query("ALTER TABLE `user_group` DROP FOREIGN KEY `FK_7ded8f984bbc2ee6ff0beee491b`");
        await queryRunner.query("DROP INDEX `IDX_bb9982562cca83afb76c0ddc0d` ON `user_group`");
        await queryRunner.query("DROP INDEX `IDX_7ded8f984bbc2ee6ff0beee491` ON `user_group`");
        await queryRunner.query("DROP TABLE `user_group`");
        await queryRunner.query("DROP TABLE `group`");
    }

}
