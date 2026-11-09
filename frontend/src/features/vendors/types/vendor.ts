export type VendorCategory =
  | 'CEMENT'
  | 'STEEL'
  | 'READY_MIX_CONCRETE'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'EARTHWORK'
  | 'FINISHING'
  | 'LABOUR_CONTRACTOR'
  | 'EQUIPMENT_RENTAL'
  | 'OTHER';

export type VendorStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'BLACKLISTED' | 'INACTIVE';

export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'TERMINATED';

export type QuotationStatus =
  | 'SUBMITTED'
  | 'UNDER_NEGOTIATION'
  | 'COUNTER_OFFERED'
  | 'ACCEPTED'
  | 'REJECTED';

export interface ProjectContract {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  contractNumber: string;
  title: string;
  category: VendorCategory;
  contractValue: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  scopeOfWork: string;
  paymentTerms: string;
}

export interface NegotiationHistoryItem {
  id: string;
  date: string;
  author: string;
  role: 'BUILDER' | 'VENDOR';
  offeredRate: number;
  unit: string;
  creditDaysOffered?: number;
  notes: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  category: VendorCategory;
  itemDescription: string;
  quantity: number;
  unit: string;
  initialQuotedRate: number;
  initialTotalAmount: number;
  currentCounterRate?: number;
  finalAgreedRate?: number;
  gstRate: number; // 0, 5, 12, 18, 28
  status: QuotationStatus;
  submittedDate: string;
  validTill: string;
  paymentTermsOffered: string;
  builderTargetRate?: number;
  negotiationHistory: NegotiationHistoryItem[];
  builderNotes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  gstin: string;
  panNumber?: string;
  rating: number; // 1 to 5
  status: VendorStatus;
  contracts: ProjectContract[];
  quotations: Quotation[];
  totalContractedValue: number;
  activeQuotationsCount: number;
  bankDetails?: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

