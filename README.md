# Binance Realtime Market & Trading Visualizer (ETH/USDT & Multi-Asset)

Plataforma full-stack de alto rendimiento para el consumo de datos de mercado en tiempo real desde la API pública de Binance (REST y WebSockets), ofreciendo herramientas interactivas de análisis técnico y visualización de operaciones conocidas sobre gráficos TradingView Lightweight Charts.

---

## 🚀 Características Principales

- **Foco en ETH/USDT y Pares Principales:** Soporte nativo y rápido para `ETHUSDT`, `BTCUSDT`, `SOLUSDT`, `BNBUSDT`, `ADAUSDT` y `XRPUSDT`.
- **Motor de Gráficos de Alto Rendimiento:** Integración de `@tradingview/lightweight-charts` con renderizado en Canvas a 60 FPS.
- **Arquitectura Híbrida (REST + WebSocket):**
  - **REST:** Carga inicial instantánea de las últimas 500 velas históricas.
  - **WebSockets:** Actualizaciones en vivo de velas en formación (sub-segundo) y flujo ininterrumpido de trades ejecutados con flashes visuales.
- **Herramientas de Visualización de Operaciones Conocidas:**
  - **Cruces de Medias Móviles (SMA 20/50/200 & EMA 9/21):** Detección automática de *Golden Cross* (señales de compra) y *Death Cross* (señales de venta).
  - **Oscilador RSI (14):** Identificación de zonas extremas de sobrecompra (>70) y sobreventa (<30).
  - **Bandas de Bollinger (20, 2):** Visualización de canales de volatilidad.
  - **Marcadores Nativos en Gráfico (`setMarkers`):** Flechas visuales en las velas acompañadas por un panel descriptivo de señales.
- **Panel de Estadísticas 24h:** Precios máximos, mínimos, cambio porcentual y volumen en tiempo real.
- **Orquestación Docker & Multi-Stage Builds:** Despliegue con un solo comando mediante Docker Compose y Nginx como proxy inverso.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TradingView Lightweight Charts, Lucide Icons |
| **Backend Proxy** | Node.js, Express, `ws` (WebSocket Gateway), Axios, TypeScript |
| **Infraestructura** | Docker (Multi-stage), Docker Compose v2, Nginx |

---

## 💻 Instrucciones de Ejecución

### Opción 1: Desarrollo Local (Recomendado)

1. **Instalar dependencias:**
   ```bash
   # Backend
   cd backend
   pnpm install

   # Frontend
   cd ../frontend
   pnpm install
   ```

2. **Iniciar Backend y Frontend en paralelo:**
   ```bash
   # En la raíz del proyecto
   pnpm dev
   ```
   - Frontend disponible en: `http://localhost:3000`
   - Backend REST & WS en: `http://localhost:4000`

---

### Opción 2: Docker Compose (Producción / Contenedores)

```bash
docker compose up --build
```
- Accede a la aplicación en `http://localhost:3000`.

---

## 📐 Endpoints de la API Backend

- `GET /api/market/symbols` - Lista de pares y temporalidades disponibles.
- `GET /api/market/klines?symbol=ETHUSDT&interval=1m&limit=500` - Velas históricas formateadas.
- `GET /api/market/stats?symbol=ETHUSDT` - Estadísticas de 24 horas.
- `GET /api/market/health` - Estado de salud y conectividad con Binance.
- `WS /ws` - Gateway WebSocket local para suscripciones `{ "action": "SUBSCRIBE", "symbol": "ETHUSDT", "interval": "1m" }`.
