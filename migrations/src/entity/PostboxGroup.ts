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

import { PostBox } from './PostBox';

import { Group } from './Group';

@Entity('postbox_group')
@Unique(['box_id', 'group_id'])
export class PostboxGroup {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => PostBox, {
        onDelete: "RESTRICT",
        nullable: false,
    })
    @JoinColumn({ name: "box_id" })
    box_id: PostBox;

    @ManyToOne(type => Group, {
        onDelete: "RESTRICT",
        nullable: false,
    })
    @JoinColumn({ name: "group_id" })
    group_id: Group;

    @Column({
        precision:1 ,
        default: () => 1
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
}
