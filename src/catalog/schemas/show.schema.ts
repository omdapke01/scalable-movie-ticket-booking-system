import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Show extends Document {
  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  movieId: string; // MongoDB Movie reference ID

  @Prop({ required: true })
  venueId: string; // MongoDB Venue reference ID
}

export const ShowSchema = SchemaFactory.createForClass(Show);
