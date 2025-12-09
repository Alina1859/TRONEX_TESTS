export interface Order {
    id: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    status: 'INIT' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    type: 'ENERGY' | 'BANDWIDTH' | 'ACTIVATION';
    amount: number;
    period: number;
    targetAddress: string;
    provider?: string | null;
    externalId?: string | null;
    buyPrice?: number | string | null;
    sellPrice: number | string;
    profit?: number | string | null;
    blockchainTransaction?: string | null;
    description?: string | null;
    details?: any;
    silent: boolean;
    source: 'BOT' | 'API' | 'WEB' | 'AUTO_REFILL' | 'SMART_REFILL';
    userId: string;
}
