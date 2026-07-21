import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MovieModule } from './movie/movie.module';
import { VenueModule } from './venue/venue.module';
import { ShowModule } from './show/show.module';
import { RedisModule } from './redis/redis.module';
import { BookingModule } from './booking/booking.module';
import { BullModule } from '@nestjs/bullmq';
import { PaymentModule } from './payment/payment.module';
import { MetricsModule } from './metrics/metrics.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SearchModule } from './search/search.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/cineglass'),
    CatalogModule,
    PrismaModule,
    AuthModule,
    MovieModule,
    VenueModule,
    ShowModule,
    RedisModule,
    BookingModule,
    PaymentModule,
    MetricsModule,
    EventEmitterModule.forRoot(),
    SearchModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
