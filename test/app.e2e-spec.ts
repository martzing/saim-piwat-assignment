import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { RestaurantModule } from './../src/restaurant/restaurant.module';
import dayjs from './../src/utils/dayjs';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestaurantModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('/auth/staff/login (POST): login success', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1', password: '1234567890' })
      .expect(201);

    const jwtRegEx =
      /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/;
    expect(body.token).toMatch(jwtRegEx);
  });

  it('/auth/staff/login (POST): invalid login params', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1%%%%', password: '1234' })
      .expect(400);
    expect(body).toEqual({
      statusCode: 400,
      message: [
        'username must contain only letters and numbers',
        'password must be longer than or equal to 5 characters',
      ],
      error: 'Bad Request',
    });
  });

  it('/booking/table/init (POST): init table success', async () => {
    const {
      body: { token },
    } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1', password: '1234567890' });

    const { body } = await request(app.getHttpServer())
      .post('/booking/table/init')
      .set('Authorization', token)
      .send({ amount: 3 })
      .expect(201);

    expect(body).toEqual({ message: 'Initialize table success' });
  });

  it('/booking/table/init (POST): invalid init table params', async () => {
    const {
      body: { token },
    } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1', password: '1234567890' });

    const { body } = await request(app.getHttpServer())
      .post('/booking/table/init')
      .set('Authorization', token)
      .send({ amount: 0 })
      .expect(400);

    expect(body).toEqual({
      statusCode: 400,
      message: [
        'amount must not be less than 1',
        'amount must be a positive number',
      ],
      error: 'Bad Request',
    });
  });

  it('/booking/table/reserve (POST): reserve table success', async () => {
    const {
      body: { token },
    } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1', password: '1234567890' });

    await request(app.getHttpServer())
      .post('/booking/table/init')
      .set('Authorization', token)
      .send({ amount: 3 });

    jest.useFakeTimers();
    const now = dayjs();
    const { body } = await request(app.getHttpServer())
      .post('/booking/table/reserve')
      .send({
        customer_name: 'Samart',
        customer_amount: 5,
        booking_time: now.add(1, 'hour').toISOString(),
      })
      .expect(201);

    const uuidRegExp =
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    expect(body.booking_id).toMatch(uuidRegExp);
    expect(body.booking_table_amount).toEqual(2);
    expect(body.table_remaining_amount).toEqual(1);
  });

  it('/booking/table/reserve (POST): invaild reserve table params', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/booking/table/reserve')
      .send({
        customer_name: 'Samart',
        customer_amount: 0,
        booking_time: '15/05/2556 06:00:00',
      })
      .expect(400);

    expect(body).toEqual({
      statusCode: 400,
      message: [
        'customer_amount must not be less than 1',
        'customer_amount must be a positive number',
        'booking_time must be a valid ISO 8601 date string',
      ],
      error: 'Bad Request',
    });
  });

  it('/booking/table/cancel (PATCH): cancel reserve table success', async () => {
    const {
      body: { token },
    } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1', password: '1234567890' });

    await request(app.getHttpServer())
      .post('/booking/table/init')
      .set('Authorization', token)
      .send({ amount: 3 });

    jest.useFakeTimers();
    const now = dayjs();
    const {
      body: { booking_id: bookingId },
    } = await request(app.getHttpServer())
      .post('/booking/table/reserve')
      .send({
        customer_name: 'Samart',
        customer_amount: 5,
        booking_time: now.add(1, 'hour').toISOString(),
      });

    const { body } = await request(app.getHttpServer())
      .patch('/booking/table/cancel')
      .send({ booking_id: bookingId })
      .expect(200);

    expect(body).toEqual({
      freed_table_amount: 2,
      table_remaining_amount: 3,
    });
  });

  it('/booking/table/cancel (PATCH): invalid cancel reserve table params', async () => {
    const { body } = await request(app.getHttpServer())
      .patch('/booking/table/cancel')
      .send({ booking_id: 'dssdffcddd422' })
      .expect(400);

    expect(body).toEqual({
      statusCode: 400,
      message: ['booking_id must be a UUID'],
      error: 'Bad Request',
    });
  });

  it('/booking/table/use (PATCH): invalid use reserve table params', async () => {
    const { body } = await request(app.getHttpServer())
      .patch('/booking/table/use')
      .send({ booking_id: 'dssdffcddd422' })
      .expect(400);

    expect(body).toEqual({
      statusCode: 400,
      message: ['booking_id must be a UUID'],
      error: 'Bad Request',
    });
  });

  it('/booking/table/clear (PATCH): clear table success', async () => {
    const {
      body: { token },
    } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1', password: '1234567890' });

    await request(app.getHttpServer())
      .post('/booking/table/init')
      .set('Authorization', token)
      .send({ amount: 3 });

    const { body } = await request(app.getHttpServer())
      .patch('/booking/table/clear')
      .set('Authorization', token)
      .send({ table_ids: [1, 2] })
      .expect(200);

    expect(body).toEqual({
      freed_table_amount: 0,
      table_remaining_amount: 3,
    });
  });

  it('/booking/table/clear (PATCH): invalid clear table params', async () => {
    const {
      body: { token },
    } = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'admin1', password: '1234567890' });

    await request(app.getHttpServer())
      .post('/booking/table/init')
      .set('Authorization', token)
      .send({ amount: 3 });

    const { body } = await request(app.getHttpServer())
      .patch('/booking/table/clear')
      .set('Authorization', token)
      .send({ table_ids: ['a', 0] })
      .expect(400);

    expect(body).toEqual({
      statusCode: 400,
      message: [
        'each value in table_ids must be a positive number',
        'each value in table_ids must be an integer number',
      ],
      error: 'Bad Request',
    });
  });
});
