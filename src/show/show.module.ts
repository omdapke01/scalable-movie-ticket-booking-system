import { Module } from '@nestjs/common';
import { ShowService } from './show.service';
import { ShowController } from './show.controller';
import { SeatsGateway } from './seats.gateway';

import { CatalogModule } from "../catalog/catalog.module";

@Module({
  imports: [CatalogModule],
  controllers: [ShowController],
  providers: [ShowService, SeatsGateway],
  exports: [ShowService, SeatsGateway],
})
export class ShowModule {}
