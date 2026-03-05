import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

import { zodTextFormat } from 'openai/helpers/zod';
import { PROMPTS_TO_SUGGEST_TASKS_TO_BE_CREATED } from 'src/shared/constants/prompts';

import { z } from 'zod';
import { SuggestWorkOrderTasksAssignationsDto } from './dtos/suggestWorkOrderTasksAssignations.dto';
import { mapTasksAssignationPrompts } from 'src/shared/models/prompts';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async suggestTasksToBeCreated(
    numberOfActiveWorkers: number,
    seasonMoment?: string,
    objective?: string,
  ) {
    const Task = z.object({
      title: z.string(),
      description: z.string(),
      requiresTaskReport: z.boolean(),
      estimatedHoursToComplete: z.number(),
    });

    const Tasks = z.object({
      tasks: z.array(Task),
    });

    if (!seasonMoment) {
      seasonMoment = 'other';
    }

    // eslint-disable-next-line prefer-const
    let { SYSTEM_CONTENT, USER_CONTENT } =
      PROMPTS_TO_SUGGEST_TASKS_TO_BE_CREATED[seasonMoment];

    if (objective) {
      USER_CONTENT = `${USER_CONTENT}. Teniendo en cuenta que actualmente hay ${numberOfActiveWorkers} empleados disponibles y siguiendo el siguiente objetivo para la semana: "${objective}"`;
    } else {
      USER_CONTENT = `${USER_CONTENT}. Teniendo en cuenta que actualmente hay ${numberOfActiveWorkers} empleados disponibles.`;
    }

    try {
      const response = await this.openai.responses.parse({
        model: 'gpt-5-mini',
        instructions: SYSTEM_CONTENT,
        input: USER_CONTENT,
        text: {
          format: zodTextFormat(Tasks, 'tasks'),
        },
      });
      const parsedData = response.output_parsed;

      return parsedData.tasks;
    } catch (error) {
      throw new InternalServerErrorException('Error with OpenAi: ' + error);
    }
  }

  async suggestWorkOrderTasksAssignations({
    workers,
    tasks,
  }: SuggestWorkOrderTasksAssignationsDto) {
    const TaskAssignation = z.object({
      taskId: z.string(),
      workerId: z.string(),
    });

    const TaskAssignations = z.object({
      taskAssignations: z.array(TaskAssignation),
    });

    const { systemContent, userContent } = mapTasksAssignationPrompts({
      workers,
      tasks,
    });

    const response = await this.openai.responses.parse({
      model: 'gpt-5-mini',
      instructions: systemContent,
      input: userContent,
      text: {
        format: zodTextFormat(TaskAssignations, 'taskAssignations'),
      },
    });

    const parsedData = response.output_parsed;

    return parsedData.taskAssignations;
  }
}
