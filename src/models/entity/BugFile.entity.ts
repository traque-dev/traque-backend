import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Bug } from 'models/entity/Bug.entity';
import { File } from 'models/entity/File.entity';

@Entity({
  name: 'bug_files',
})
export class BugFile extends BaseEntity {
  @ManyToOne(() => Bug, (bug) => bug.files, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'bug_id',
  })
  bug: Bug;

  @ManyToOne(() => File, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'file_id',
  })
  file: File;
}
