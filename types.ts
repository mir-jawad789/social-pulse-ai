export interface TrendItem {
  topic: string;
  description: string;
  monthlyBreakdown?: {
    [month: string]: number;
  };
  sentiment?: number;
  excitementLevel?: number;
}

export interface MentionedEntity {
  name: string;
  type: 'Retailer' | 'Brand' | 'E-commerce Website' | 'Celebrity/Influencer';
  influenceScore: number;
}

export interface TrendReport {
  googleTrends?: TrendItem[];
  tiktokTrends?: TrendItem[];
  redditTrends?: TrendItem[];
  instagramTrends?: TrendItem[];
  facebookTrends?: TrendItem[];
  xTrends?: TrendItem[];
}

export interface AITrendResponse extends TrendReport {
    mentionedEntities?: MentionedEntity[];
}


export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface TrendFilters {
    country: string;
    timeRange: string;
    keywords: string;
    logic: 'AND' | 'OR';
    entityType: string;
    language: string;
}

export interface ReportData {
  trends: TrendReport;
  sources: GroundingChunk[];
  mentions: MentionedEntity[];
}

export interface HistoricalReport {
  id: number;
  date: string;
  filters: TrendFilters;
  reportData: ReportData;
}