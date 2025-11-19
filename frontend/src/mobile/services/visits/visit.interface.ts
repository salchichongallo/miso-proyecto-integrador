export interface RawVisit {
  visit_id: string;
  client_id: string;
  vendor_id: string;
  contact_name: string;
  contact_phone: string;
  visit_datetime: string;
  observations: string;
  bucket_data: BucketItem[];
  created_at: string;
  updated_at: string;
}

export interface BucketItem {}

export interface SearchResult {
  total: number;
  visits: VisitItem[];
}

export interface VisitItem {
  visitId: string;
  institution: InstitutionItem;
  visitedAt: string;
  observations: string;
  contactName: string;
  mediaItems: BucketItem[];
}

export interface InstitutionItem {
  id: string;
  name: string;
  country: string;
  location: string;
}
