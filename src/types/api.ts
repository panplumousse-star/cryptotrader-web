// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
  mfaCode?: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    mfaEnabled: boolean
  }
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

// Trading types
export interface PlaceOrderRequest {
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop_loss' | 'take_profit'
  amount: number
  price?: number
  stopPrice?: number
}

export interface PlaceOrderResponse {
  orderId: string
  status: string
  createdAt: string
}

export interface CancelOrderRequest {
  orderId: string
}

// Market data types
export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketPair {
  symbol: string
  baseCurrency: string
  quoteCurrency: string
  minOrderSize: number
  maxOrderSize: number
  priceIncrement: number
  sizeIncrement: number
}

// Portfolio types
export interface PortfolioAsset {
  id: string
  symbol: string
  name: string
  amount: number
  averagePrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
  allocation: number
}

export interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
  dailyPnl: number
  dailyPnlPercent: number
  changeSinceStart: number
  changeSinceStartPercent: number
}

export interface PortfolioResponse {
  summary: PortfolioSummary
  assets: PortfolioAsset[]
}
