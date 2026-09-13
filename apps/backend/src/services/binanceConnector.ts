import { Spot } from '@binance/spot';
import {
  BINANCE_REST_BASE_URL,
  BINANCE_WS_API_URL,
  BINANCE_WS_STREAMS_URL,
} from '../config/constants.js';

export const binanceConnector = new Spot({
  configurationRestAPI: {
    apiKey: process.env.BINANCE_API_KEY || '',
    apiSecret: process.env.BINANCE_API_SECRET || '',
    basePath: BINANCE_REST_BASE_URL,
    timeout: 10000,
    retries: 3,
    backoff: 1000,
  },
  configurationWebsocketAPI: {
    apiKey: process.env.BINANCE_API_KEY || '',
    apiSecret: process.env.BINANCE_API_SECRET || '',
    wsURL: BINANCE_WS_API_URL,
  },
  configurationWebsocketStreams: {
    wsURL: BINANCE_WS_STREAMS_URL,
    reconnectDelay: 1000,
  },
});

export const binanceRestAPI = binanceConnector.restAPI;
export const binanceWebsocketAPI = binanceConnector.websocketAPI;
export const binanceWebsocketStreams = binanceConnector.websocketStreams;
