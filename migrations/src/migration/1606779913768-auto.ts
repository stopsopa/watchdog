import {MigrationInterface, QueryRunner} from "typeorm";

export class auto1606779913768 implements MigrationInterface {
    name = 'auto1606779913768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `postbox` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `box` varchar(255) NOT NULL, `description` mediumtext NULL, `enabled` tinyint(1) NOT NULL DEFAULT 0, `password` varchar(255) NULL, `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` datetime NULL ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX `IDX_0cfc6ee705bacfcf9d9da1f63d` (`box`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `postbox_group` (`id` int NOT NULL AUTO_INCREMENT, `enabled` tinyint(1) NOT NULL DEFAULT 1, `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` datetime NULL ON UPDATE CURRENT_TIMESTAMP, `box_id` int NOT NULL, `group_id` int NOT NULL, UNIQUE INDEX `IDX_07f00d4babe7c5f8353f573b0c` (`box_id`, `group_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `postbox_user` (`id` int NOT NULL AUTO_INCREMENT, `enabled` tinyint(1) NOT NULL DEFAULT 1, `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` datetime NULL ON UPDATE CURRENT_TIMESTAMP, `box_id` int NOT NULL, `user_id` int NOT NULL, UNIQUE INDEX `IDX_c327506f43af4b97ecc3e34345` (`box_id`, `user_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `postbox_group` ADD CONSTRAINT `FK_8c7978218040f1a0ed23aa97db4` FOREIGN KEY (`box_id`) REFERENCES `postbox`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `postbox_group` ADD CONSTRAINT `FK_d1e7e98043123d2fddb5d60beb4` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `postbox_user` ADD CONSTRAINT `FK_7235e1b4874e7fee0f3c495b52c` FOREIGN KEY (`box_id`) REFERENCES `postbox`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `postbox_user` ADD CONSTRAINT `FK_4eaf77a1ea3440b88cdb2796b28` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `postbox_user` DROP FOREIGN KEY `FK_4eaf77a1ea3440b88cdb2796b28`");
        await queryRunner.query("ALTER TABLE `postbox_user` DROP FOREIGN KEY `FK_7235e1b4874e7fee0f3c495b52c`");
        await queryRunner.query("ALTER TABLE `postbox_group` DROP FOREIGN KEY `FK_d1e7e98043123d2fddb5d60beb4`");
        await queryRunner.query("ALTER TABLE `postbox_group` DROP FOREIGN KEY `FK_8c7978218040f1a0ed23aa97db4`");
        await queryRunner.query("DROP INDEX `IDX_c327506f43af4b97ecc3e34345` ON `postbox_user`");
        await queryRunner.query("DROP TABLE `postbox_user`");
        await queryRunner.query("DROP INDEX `IDX_07f00d4babe7c5f8353f573b0c` ON `postbox_group`");
        await queryRunner.query("DROP TABLE `postbox_group`");
        await queryRunner.query("DROP INDEX `IDX_0cfc6ee705bacfcf9d9da1f63d` ON `postbox`");
        await queryRunner.query("DROP TABLE `postbox`");
    }

}
