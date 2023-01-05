import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';

@Controller('/events')
export class EventsController {
  @Get()
  findAll() {
    return [
      { id: 1, name: 'Fist Event' },
      { id: 2, name: 'Second Event' },
    ];
  }

  @Get(':id')
  findOne(@Param('id') id) {
    return { id: 1, name: 'Fist Event' };
  }

  @Post()
  create(@Body() input: CreateEventDto) {
    return input;
  }

  @Patch(':id') // patch allows to update just some fields, not all of them like in PUT
  update(@Param('id') id, @Body() input: UpdateEventDto) {
    return input;
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id) {}
}
