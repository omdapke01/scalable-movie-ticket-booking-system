import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { SearchService } from "./search.service";
import { MovieSearchController } from "./movie-search.controller";
import { MovieIndexingListener } from "./listeners/movie-indexing.listener";

import { CatalogModule } from "../catalog/catalog.module";

@Module({
  imports: [
    CatalogModule,
    ElasticsearchModule.registerAsync({
      useFactory: () => {
        const node = process.env.ELASTICSEARCH_NODE || "http://localhost:9200";
        const username = process.env.ELASTICSEARCH_USERNAME;
        const password = process.env.ELASTICSEARCH_PASSWORD;

        const config: any = { node };
        if (username && password) {
          config.auth = { username, password };
        }
        return config;
      },
    }),
  ],
  controllers: [MovieSearchController],
  providers: [SearchService, MovieIndexingListener],
  exports: [SearchService],
})
export class SearchModule {}
