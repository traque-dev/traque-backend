import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Feedback } from 'models/entity/Feedback.entity';
import { File } from 'models/entity/File.entity';

@Entity({
  name: 'feedback_files',
})
export class FeedbackFile extends BaseEntity {
  @ManyToOne(() => Feedback, (feedback) => feedback.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'feedback_id',
  })
  feedback: Feedback;

  @ManyToOne(() => File, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'file_id',
  })
  file: File;
}
