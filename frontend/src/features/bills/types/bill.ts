export type BillCategory = 'MATERIAL' | 'LABOUR' | 'MACHINERY' | 'SERVICES' | 'OTHER';

export type BillStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_PAID' | 'PAID';

export type PaymentMode = 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'CASH' | 'OTHER';

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  paymentDate: string;
  mode: PaymentMode;
  referenceNumber?: string;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  vendorId?: string;
  vendorName: string;
  vendorGstin?: string;
  billNumber: string;
  billDate: string;
  dueDate?: string;
  category: BillCategory;
  description?: string;
  baseAmount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: BillStatus;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  paidAmount: number;
  outstandingAmount: number;
  payments: Payment[];
  challanNumber?: string;
  fileAttachmentName?: string;
}

