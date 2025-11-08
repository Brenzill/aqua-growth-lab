export interface EDIFileLog {
  id: string;
  networkAddress: string;
  batchNumber: string;
  date: string;
  time: string;
  provider: string;
  versionNumber: string;
  totalCartonCount: number;
  totalPalletCount: number;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
}

export interface ContainerSeal {
  id: string;
  season?: string;
  locationCode?: string;
  organization?: string;
  stuffDate?: string;
  containerNo: string;
  sealNumber: string;
  barcode?: string;
  noCartons?: number;
  gross?: number;
  nett?: number;
  commodityCode?: string;
  varietyCode?: string;
  gradeCode?: string;
  packCode?: string;
  countCode?: string;
  markCode?: string;
  targetMarket?: string;
  country?: string;
  farmNo?: string;
  phc?: string;
  orchard?: string;
  inspectionDate?: string;
  inspPoint?: string;
  inspCode?: string;
  originalIntakeDate?: string;
  consignmentNoteNo?: string;
  temptale?: string;
  inventoryCode?: string;
  phytoData?: string;
  upn?: string;
  consecNo?: string;
  targetCountry?: string;
  productionArea?: string;
  shipName?: string;
  voyageNo?: string;
  callSign?: string;
}

export interface PalletOut {
  id: string;
  palletNo: string;
  loadRef: string;
  cartonCount: number;
  containerNo: string;
  status: string;
}

export interface ProcessedRecord {
  type: 'BH' | 'OH' | 'OL' | 'OK' | 'OC' | 'OP' | 'BT';
  data: any;
  lineNumber: number;
}
