import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    Unique,
} from "typeorm";

import { Group } from './Group';

@Entity('users')
@Unique(['email'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Collumn types: https://github.com/typeorm/typeorm/blob/master/docs/entities.md#column-types-for-mysql--mariadb
     * https://github.com/typeorm/typeorm/blob/master/src/driver/types/ColumnTypes.ts
     */
    @Column({
        length: 50,
        comment: 'firstName',
    })
    firstName: string;

    @Column({
        length: 50,
        comment: 'firstName',
    })
    lastName: string;

    @Column({
        length: 255
    })
    email: string;

    @Column("mediumtext", {
        nullable: true,
    })
    password: string;

    @Column({
        precision:1 ,
        default: () => '0'
    })
    enabled: boolean;

    @Column("datetime", {
        default: () => 'CURRENT_TIMESTAMP',
    })
    created: Date;

    @Column("datetime", {
        default: () => null,
        nullable: true,

        onUpdate: "CURRENT_TIMESTAMP" // available for DATETIME since MySQL 5.6.5 https://stackoverflow.com/a/168832/5560682
        // if in your version of mysql it's not supported then comment this line out and update manually in backend model
    })
    updated: Date;

    @ManyToMany(
        type => Group,
        {
            onDelete: "RESTRICT"
        }
    )
    // https://github.com/typeorm/typeorm/blob/master/docs/relations.md#joincolumn-options
    @JoinTable({
        name: "user_group",
        joinColumns: [
            { name: 'user_id' }
        ],
        inverseJoinColumns: [
            { name: 'group_id' }
        ],
    })
    roles: Group[];
}
