export interface MapData {
  province: string;
  code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  programCount: number;
  beneficiaries: number;
  programs: Array<{
    id: string;
    name: string;
    category: string;
    beneficiaries: number;
    status: string;
  }>;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

export interface MapWrapperData {
  province: string;
  code: string;
  programCount: number;
  beneficiaries: number;
}
