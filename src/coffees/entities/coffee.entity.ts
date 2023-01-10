import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Flavor } from './flavor.entity';

/* Coffee Entity FINAL CODE */
@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  brand: string;

  @Column({ default: 0 })
  recommendations: number;

  @JoinTable()
  @ManyToMany(() => Flavor, (flavor) => flavor.coffees, { cascade: true })
  flavors: Flavor[];
}
