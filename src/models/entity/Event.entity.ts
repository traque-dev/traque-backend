import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './Base.entity';
// import { Person } from './Person.entity';
import { Project } from './Project.entity';

@Entity({
  name: 'events',
})
export class Event extends BaseEntity {
  @ManyToOne(() => Project)
  @JoinColumn({
    name: 'project_id',
  })
  project: Project;

  // @ManyToOne(() => Person, {
  //   nullable: true,
  // })
  // @JoinColumn({
  //   name: 'person_id',
  // })
  // person?: Person;

  @Column({
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  properties?: Record<string, any>;

  constructor(props: ExtractEntityProps<Event>) {
    super();

    Object.assign(this, props);
  }

  // setPerson(person: Person) {
  //   this.person = person;

  //   return this;
  // }
}
