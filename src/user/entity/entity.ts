import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    username: string

    @Column({unique:true})
    email: string

    @Column()
    password: string

}