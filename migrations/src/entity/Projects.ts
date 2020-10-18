import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    JoinTable,
    ManyToMany,
    Unique,
} from "typeorm";

@Entity('projects')
export class Projects {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Collumn types: https://github.com/typeorm/typeorm/blob/master/docs/entities.md#column-types-for-mysql--mariadb
     * https://github.com/typeorm/typeorm/blob/master/src/driver/types/ColumnTypes.ts
     */
    @Column({
        length: 255,
        comment: 'name',
    })
    name: string;

    @Column("mediumtext", {
        nullable: true,
    })
    description: null;

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
}
