import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TaskStatusEnum } from '../enums/taskStatus.enum';
import { TaskReport } from './taskReport.schema';
import { User } from 'src/user/schemas/user.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: TaskStatusEnum.PENDING })
  status: TaskStatusEnum;

  @Prop({ required: true })
  requiresTaskReport: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  workerAssigned?: User;

  // Time when the task was started (it changed its status to IN_PROGRESS)
  @Prop({ type: Date })
  startTime?: Date;

  @Prop()
  estimatedHoursToComplete?: number;

  @Prop()
  realHoursToComplete?: number;

  @Prop()
  taskReport?: TaskReport;

  @Prop({ min: 1, max: 10 })
  rating?: number;

  @Prop()
  ratingComment?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
