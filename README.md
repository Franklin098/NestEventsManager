# NestJS Backend App - Events Manager

### Nest Cli

```bash
npm install --global @nestjs/cli
```

### Start New Project

```bash
nest new <project-name>
```

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Project Structure

**Standard Mode:** One repository contains exactly one Nest project.

**Monorepo Mode:** One repository contains multiple Nest projects/apps (some of them sharing common code)

By default Nest is initialized with standard mode.

The src/ folder contains our application logic.

The test/ folder contains all end-to-end tests.

## Src

Nest is a **modular** framework. As our application grows, we are going to create more modules.

A typical module contains: Controller, Service, Tests, and other parts.

The application starting point is the **main.ts** file, which starts listening to a port.

By default it is also created the **app** module:

- app.module.ts: It contains the @module decorator
- app.controller.ts: There we define API endpoints.
- app.service.ts: Here we add all the business logic, it is not related with handling API requests or sending the response (endpoints), that job is done by the controller.

The test files have a .spec. extension: `app.controller.spec.ts` is the test file for `app.controller.ts`

## Controllers

The controllers are class annotated with the @Controller decorator. Controllers has actions, and action is simply a method that it is associated with an http path for handling requests.

For example:

```
@Get()
getUsers(){

}
```

Is associated with GET /users requests

The job of controllers is to by the entry point for http request using a path and a Rest method (GET, POST, PUT, etc).

**Routing:** is about telling Nest how to convert paths into methods.

Adding the Path prefix:

```
@Controller({path:'/events'})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// or:

@Controller('/events')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

If there is no path prefix, then the controller becomes a top level controller.

We can also define the path for an **action** by using the decorator

```
@Get('/bye')
getBye() {
  return 'Bye !';
}
```

**Resource:** typically resources are database entities: 'Event', 'User', 'Event'.

For every resource we can perform CRUD **actions**: 'Create a User', 'Delete a User'.

For every action we have REST methods: GET, POST, PUT.

A good practice is too **keep your controllers tin**, do not add to many actions to handle (max 5 is a good number).

> Every time we create a new Controller we should add the import inside the app.module.ts controllers array.

```
import { EventsController } from './events.controller';

@Module({
  imports: [],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}
```

### Path Parameters

To use path parameteres we need to:

- Route by adding a ':parameter-name' in the decorator string value, e.g: `@Get(':id')`
- To actually use the value passed by the request we need to also add the `@Param('id') id` decorator to the method variable/.

```
@Controller('/events')
export class EventsController {

  @Get(':id')
  findOne(@Param('id') id) {
    return id;
  }
}
```

If you don't add a string value inside the `@Param()` decorator, then you get an object with all the params.

```
@Controller('/events')
export class EventsController {

  @Get(':id')
  findOne(@Param() params) {
    // params is an object -> {id:'value'}
    return params;
  }
}
```

### Request Body

With the `@Body()` decorator we access to the request body

```
  @Post()
  create(@Body() input) {

  }

  @Patch(':id')
  update(@Param('id') id, @Body() input) {

  }
```

### Responses and status code

We simply use the return statement. Nest already takes care to return 201 code for created or 200 for other methods.

Using the `@HttpCode(204)` annotation we can specify a custom response code.

```
  @Get(':id')
  findOne(@Param('id') id) {
    return { id: 1, name: 'Fist Event' };
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id) {

  }
```

![](./metadata/status-codes.png)

### DTO - Data Transfer Objects

A problem with very generic body object, is that we don't know what we are receiving in the request.

We can create a Data Transfer Object, which models the data that we are going to receive.

File: `create-event.dto.ts`

```
export class CreateEventDto {
  name: string;
  description: string;
  when: string;
  address: string;
}

// inside events.controller.ts

 @Post()
  create(@Body() input: CreateEventDto) {
    return input;
  }
```

Using types makes everything more clear an specific, avoid errors.

For Updates (PATCH) actions we will create a different DTO. We don't want to force users to send data that won't change.
We can create a DTO class with all the fields optional, but Typescript and NestJS gives you some powerful tools to write less code. `npm install --save @nestjs/mapped-types`.

```
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {

}

// it has all the fields of CreateEventDto but all are optional.
```

### Connecting to a Database

Install TypeORM and MySQL modules for NestJS `npm install --save @nestjs/typeorm typeorm mysql`

Add the TypeORM module to the imports in `app.module.ts`:

The forRoot method is a common name when you want to add parameters to an static module.

```
// app.module.ts

import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'example',
      database: 'nest-events',
      entities: [Event],
      synchronize: true, // by default is false, be careful. Automatically updates your database schema when you change your entities.
    }),
  ],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}
```

The synchronize property automatically updates your database schema when you change your entities. You must have it enable in every environment, or avoid use it. By default is false.

## Entities

Every Entity class must be decorated with an `@Entity()` decorator, TypeORM assigns a table name automatically, but you can also specify the name by adding a string as parameter in the decorator, the second argument are the entity options, you can also specify the name there, default sorted number, and other options.

```
import {Entity} form 'typeorm';

@Entity('event',{name:'event'})
export class Event{
  @PrimaryGeneratedColumn('increment')
  id:number,

  @Column('varchar',{ length: 100 })
  name: string;
}
```

To mark an attribute as a primary key use the `@PrimaryColumn()` decorator, you can use multiple attributes if you want to define a composite key. Use `@PrimaryGeneratedColumn()` to create an auto-generated value, you can pass the generation strategy as an argument, eg: auto-increment, uuid, etc.

Mark all the rest of attributes with the `@Column()` decorator. TypeORM tries to automatically recognize the type of the attribute, you can pass an specific type as argument, but it should be a Database specific type. ` @Column('varchar')`, you can also pass column options ` @Column('varchar',{type, name, length, nullable, unique, comment, etc})`.

Go to the TypeORM docs to see in details all the options.

## Repository Pattern

A row of our database is represented by an instance of an Entity object.

We have a table named 'User', then a single row of that table is an instance of User object in our program.

A table is managed by a repository. A repository manages all the table operations.

We can use two types of repositories: a Generic Repository and a Specific Repository.

**Generic repository** is always available, contains basic methods like save, find, findOne, etc. Most operations can be achieved using a generic repository.

TypeORM provides a generic class which you can use. E.g: `Repository<Event>`.

You can use a **Specific Repository** if you want to add complex and very specific query for a particular table, or if you find out that you are writing similar queries for multiple tables in your code. E.g: `EventRepository`.

Use dependency injection to use your Repository inside your Controller.

events.controller.ts:

```
@Controller('/events')
export class EventsController {

  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
  ) {}

  @Get()
  async findAll() {
    return await this.repository.find();
  }
}
```

Also, we need to tell the Module we are going to need the Repository. Nest takes care of injecting it.

app.module.ts:

```
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'example',
      database: 'nest-events',
      entities: [Event],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Event]), // This will make a Repository for a specific Entity to be available to be Inject in Nest. You need to this for every entity and in every module this repository needs to be injected.
  ],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
```

You need to this for every entity and in every module this repository needs to be injected.

Some practice queries using TypeORM:

```
  @Get('/practice')
  async practiceQueries() {
    // SELECT * FROM event WHERE event.id > 3 and event.when > '2021-02-12T13:00:00'
    return await this.repository.find({
      where: {
        id: MoreThan(3),
        when: MoreThan(new Date('2021-02-12T13:00:00')),
      },
    });
  }

```

To use OR operator, simple use an array instead of an object:

```
// SELECT id,name FROM Event where (event.id > 3 AND event.when > 'x' ) OR event.description LIKE '%meet%' ORDER by event.id DESC

    await this.repository.find({
      select: ['id', 'name'],
      where: [
        {
          id: MoreThan(3),
          when: MoreThan(new Date('2021-02-12T13:00:00')),
        },
        {
          description: Like('%meet%'),
        },
      ],
      order: {
        id: 'DESC',
      },
    });
```

Go to the TypeORM Docs to see more Operations available and how to use them. You can use Caching, relations, etc.

## Pipes - Data Validation

What is a Pipe?

It simply represent a process where we validate and transform data.

We receive the Input from an API request from the client, then we pass that input into a Pipe where we perform some actions.

Input -> Pipe [Validate, Transform, Custom] -> Results.

NestJS provides some build-in pipes, like the ParseIntPipe, which automatically parses a string in a Param to a Int.

events.controller.ts

```
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe, new MyCustomPipe("my-param")) id) {
    const event = await this.repository.findOneBy({ id });
    return event;
  }
```

You can add more pipes by simply adding commas, if you need to pass a parameter to the Pipe, you need to create a new instance explicitly, otherwise you can simply use the class name.

One of the most frequently use pipes is the **ValidationPipe**.

### ValidationPipe

Install the Class Validator and Class Transformer libraries

`npm i -S class-validator class-transformer`

These packages are used by the ValidationPipe.

Use class-validator decorators to add validations to your input DTO:

```
import { Length } from 'class-validator';

export class CreateEventDto {
  @Length(5, 255, { message: 'name must have a length between [5,25]' })
  name: string;

  @IsString()
  @Length(5, 255)  // you can use  multiple validators
  description: string;

  when: string;
  address: string;
}

```

If you now send a POST request to the create /events endpoint with a "name" too short, you'll receive an error:

```
// Request POST:
{
    "name":"a",
    "description":"hi",
    "when":"2022-02-02",
    "address":"22 av"
}

// Response:
{
    "statusCode": 400,
    "message": [
        "name must have a length between [5,25]"
    ],
    "error": "Bad Request"
}
```

> Go to the class-validator Docs to see all the decorators and options.

Add the ValidationPipe in your Controller

events.controller.ts

```
  @Post()
  async create(@Body(ValidationPipe) input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }
```

**Enable validation globally**: You can enable the Validation Pipe globally so you don't need to specify it on ever input body.

Go to main.ts

```
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // All the Application Inputs are going to pass by the ValidationPipe
  await app.listen(3000);
}
bootstrap();
```

### Validation Groups & Options

Validation Groups works like tags. You can apply validations or make them work different based on the **Context**.

```
export class CreateEventDto {

  @Length(5, 255, { groups: ['create'] })
  @Length(10, 20, { groups: ['update'] })
  address: string;
}
```

Now we apply different length validation based on the current group. We can specify the group in the Controller:

events.controller.ts

```

  @Post()
  async create(
    @Body(new ValidationPipe({ groups: ['create'] })) input: CreateEventDto,
  ) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }

```

> You must disable the Global Validation to make Groups work.

We can use the `@UsePipes()` to apply Pipes in a **method** or **class** level.

Some Validator Options: skipUndefined, whitelist (remove all properties that don't have a validator decorator), forbidNonWhitelisted (throw and error if an unknown attribute is received)
