import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";

@WebSocketGateway({
  namespace: "seats",
  cors: {
    origin: "*",
  },
})
@Injectable()
export class SeatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SeatsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinShow")
  handleJoinShow(client: Socket, payload: { showId: string }) {
    if (payload?.showId) {
      client.join(payload.showId);
      this.logger.log(`Client ${client.id} joined room for show ${payload.showId}`);
      return { event: "joined", data: payload.showId };
    }
  }

  @SubscribeMessage("leaveShow")
  handleLeaveShow(client: Socket, payload: { showId: string }) {
    if (payload?.showId) {
      client.leave(payload.showId);
      this.logger.log(`Client ${client.id} left room for show ${payload.showId}`);
      return { event: "left", data: payload.showId };
    }
  }

  broadcastSeatStatus(showId: string, seatCode: string, status: string) {
    if (this.server) {
      this.server.to(showId).emit("seatStatusChanged", { seatCode, status });
      this.logger.log(`Broadcasted seat status changed to room ${showId}: seat ${seatCode} -> ${status}`);
    }
  }
}
