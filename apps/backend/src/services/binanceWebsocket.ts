import { binanceWebsocketAPI } from './binanceConnector.js';

export type BinanceWebsocketConnection = Awaited<ReturnType<typeof binanceWebsocketAPI.connect>>;

export class BinanceWebsocketService {
  public connect(): Promise<BinanceWebsocketConnection> {
    return binanceWebsocketAPI.connect();
  }

  public async disconnect(connection: BinanceWebsocketConnection): Promise<void> {
    await connection.disconnect();
  }

  public async withConnection<T>(
    operation: (connection: BinanceWebsocketConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.connect();

    try {
      return await operation(connection);
    } finally {
      await this.disconnect(connection);
    }
  }
}

export const binanceWebsocketService = new BinanceWebsocketService();
