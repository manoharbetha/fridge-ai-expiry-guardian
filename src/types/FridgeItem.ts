
export interface FridgeItem {
  id: string;
  name: string;
  category: string;
  openDate: Date;
  printedExpiry: Date;
  predictedExpiry: Date;
  status: 'fresh' | 'warning' | 'critical' | 'expired';
  notificationSent: boolean;
}

export interface FeatureSchema {
  itemType: string;
  openDate: string;
  tempAvg: number;
  doorRate: number;
}

export interface PredictionResponse {
  predictedDaysLeft: number;
}
