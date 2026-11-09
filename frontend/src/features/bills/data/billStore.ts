import type { Bill, Payment, PaymentMode } from '../types/bill';

const STORAGE_KEY = 'forgeos_bills';

export const initialBills: Bill[] = [
  {
    id: 'BILL-001',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Green Valley Residency',
    vendorName: 'UltraTech Cement Ltd',
    vendorGstin: '07AAACU8044B1Z5',
    billNumber: 'INV-UTC-2026-891',
    billDate: '2026-10-25',
    dueDate: '2026-11-20',
    category: 'MATERIAL',
    description: '1,200 bags OPC 53 grade cement for 4th slab casting',
    baseAmount: 450000,
    gstPercent: 18,
    gstAmount: 81000,
    totalAmount: 531000,
    status: 'PENDING',
    submittedBy: 'Aarav Sharma (PM)',
    submittedAt: '2026-10-26T10:15:00Z',
    paidAmount: 0,
    outstandingAmount: 531000,
    payments: [],
    challanNumber: 'CH-8821',
    fileAttachmentName: 'UltraTech_Challan_8821.pdf',
  },
  {
    id: 'BILL-002',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Green Valley Residency',
    vendorName: 'Kamdhenu Steel Traders',
    vendorGstin: '07AABCK1234M1Z2',
    billNumber: 'KST-2026-104',
    billDate: '2026-10-10',
    dueDate: '2026-11-05', // Overdue
    category: 'MATERIAL',
    description: '15 Tonnes Fe 550D TMT Rebars',
    baseAmount: 920000,
    gstPercent: 18,
    gstAmount: 165600,
    totalAmount: 1085600,
    status: 'APPROVED',
    submittedBy: 'Aarav Sharma (PM)',
    submittedAt: '2026-10-11T09:00:00Z',
    approvedBy: 'Rakesh Verma (Admin)',
    approvedAt: '2026-10-12T14:30:00Z',
    paidAmount: 0,
    outstandingAmount: 1085600,
    payments: [],
    challanNumber: 'CH-4910',
    fileAttachmentName: 'Kamdhenu_Invoice_104.pdf',
  },
  {
    id: 'BILL-003',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Green Valley Residency',
    vendorName: 'Shree Ram RMC Plant',
    vendorGstin: '07AAACS4321K1Z1',
    billNumber: 'RMC-NOV-019',
    billDate: '2026-10-15',
    dueDate: '2026-11-15',
    category: 'MATERIAL',
    description: 'M25 Ready Mix Concrete (85 cum)',
    baseAmount: 340000,
    gstPercent: 18,
    gstAmount: 61200,
    totalAmount: 401200,
    status: 'PARTIALLY_PAID',
    submittedBy: 'Aarav Sharma (PM)',
    submittedAt: '2026-10-16T11:20:00Z',
    approvedBy: 'Rakesh Verma (Admin)',
    approvedAt: '2026-10-17T16:00:00Z',
    paidAmount: 200000,
    outstandingAmount: 201200,
    payments: [
      {
        id: 'PAY-001',
        billId: 'BILL-003',
        amount: 200000,
        paymentDate: '2026-10-28',
        mode: 'BANK_TRANSFER',
        referenceNumber: 'NEFT-HDFC-991823',
        remarks: 'Part payment as per delivery verification',
        recordedBy: 'Rakesh Verma (Admin)',
        createdAt: '2026-10-28T12:00:00Z',
      },
    ],
    challanNumber: 'RMC-CH-092',
    fileAttachmentName: 'RMC_Challan_019.pdf',
  },
  {
    id: 'BILL-004',
    projectId: '2',
    projectCode: 'PRJ-002',
    projectName: 'Skyline Commercial Hub',
    vendorName: 'L&T Heavy Machinery Rentals',
    vendorGstin: '27AAACL0123P1Z9',
    billNumber: 'LNT-EQ-4491',
    billDate: '2026-10-20',
    dueDate: '2026-11-25',
    category: 'MACHINERY',
    description: 'Tower Crane & Boom Placer Monthly Hire',
    baseAmount: 280000,
    gstPercent: 18,
    gstAmount: 50400,
    totalAmount: 330400,
    status: 'PENDING',
    submittedBy: 'Priya Mehta (PM)',
    submittedAt: '2026-10-21T15:45:00Z',
    paidAmount: 0,
    outstandingAmount: 330400,
    payments: [],
    fileAttachmentName: 'LNT_Machinery_Invoice.pdf',
  },
  {
    id: 'BILL-005',
    projectId: '2',
    projectCode: 'PRJ-002',
    projectName: 'Skyline Commercial Hub',
    vendorName: 'Jindal Steel & Power',
    vendorGstin: '27AAACJ5512B1Z8',
    billNumber: 'JSP-DL-9921',
    billDate: '2026-09-28',
    dueDate: '2026-10-28', // Overdue
    category: 'MATERIAL',
    description: 'Structural Steel Beams (22 Tonnes)',
    baseAmount: 1450000,
    gstPercent: 18,
    gstAmount: 261000,
    totalAmount: 1711000,
    status: 'APPROVED',
    submittedBy: 'Priya Mehta (PM)',
    submittedAt: '2026-09-29T10:00:00Z',
    approvedBy: 'Rakesh Verma (Admin)',
    approvedAt: '2026-10-01T11:00:00Z',
    paidAmount: 0,
    outstandingAmount: 1711000,
    payments: [],
    challanNumber: 'JSP-44102',
    fileAttachmentName: 'Jindal_Tax_Invoice.pdf',
  },
  {
    id: 'BILL-006',
    projectId: '2',
    projectCode: 'PRJ-002',
    projectName: 'Skyline Commercial Hub',
    vendorName: 'Apex Labour Contractors',
    vendorGstin: '27AAACA9921Q1Z4',
    billNumber: 'ALC-OCT-2026',
    billDate: '2026-10-31',
    dueDate: '2026-11-10',
    category: 'LABOUR',
    description: 'Fortnightly shuttering & bar bending manpower payout',
    baseAmount: 320000,
    gstPercent: 18,
    gstAmount: 57600,
    totalAmount: 377600,
    status: 'PENDING',
    submittedBy: 'Priya Mehta (PM)',
    submittedAt: '2026-11-01T08:30:00Z',
    paidAmount: 0,
    outstandingAmount: 377600,
    payments: [],
    fileAttachmentName: 'Apex_Labour_Attendance_Bill.pdf',
  },
  {
    id: 'BILL-007',
    projectId: '3',
    projectCode: 'PRJ-003',
    projectName: 'Riverside Heights',
    vendorName: 'Asian Paints Pro Contractor',
    vendorGstin: '09AAACA1122C1Z3',
    billNumber: 'AP-NOIDA-5541',
    billDate: '2026-07-15',
    dueDate: '2026-08-15',
    category: 'MATERIAL',
    description: 'Exterior weatherproof primer & Apex Ultima finish (450 Litres)',
    baseAmount: 195000,
    gstPercent: 28,
    gstAmount: 54600,
    totalAmount: 249600,
    status: 'PAID',
    submittedBy: 'Rohan Verma (PM)',
    submittedAt: '2026-07-16T10:00:00Z',
    approvedBy: 'Rakesh Verma (Admin)',
    approvedAt: '2026-07-18T14:00:00Z',
    paidAmount: 249600,
    outstandingAmount: 0,
    payments: [
      {
        id: 'PAY-002',
        billId: 'BILL-007',
        amount: 249600,
        paymentDate: '2026-08-10',
        mode: 'BANK_TRANSFER',
        referenceNumber: 'RTGS-AXIS-881234',
        remarks: 'Full settlement against completion',
        recordedBy: 'Rakesh Verma (Admin)',
        createdAt: '2026-08-10T16:00:00Z',
      },
    ],
    fileAttachmentName: 'AsianPaints_Receipt.pdf',
  },
  {
    id: 'BILL-008',
    projectId: '4',
    projectCode: 'PRJ-004',
    projectName: 'Urban Square',
    vendorName: 'Jaipur Bricks & Aggregates',
    vendorGstin: '08AAACJ7788P1Z6',
    billNumber: 'JBA-2026-90',
    billDate: '2026-10-18',
    dueDate: '2026-11-18',
    category: 'MATERIAL',
    description: 'Red clay wire-cut bricks 30,000 nos',
    baseAmount: 210000,
    gstPercent: 5,
    gstAmount: 10500,
    totalAmount: 220500,
    status: 'REJECTED',
    submittedBy: 'Neha Kapoor (PM)',
    submittedAt: '2026-10-19T14:20:00Z',
    approvedBy: 'Rakesh Verma (Admin)',
    approvedAt: '2026-10-21T11:00:00Z',
    rejectionReason: 'Challan quantity shows only 20,000 bricks delivered. Please check with site supervisor and resubmit.',
    paidAmount: 0,
    outstandingAmount: 220500,
    payments: [],
    challanNumber: 'JBA-CH-12',
    fileAttachmentName: 'JaipurBricks_Invoice.pdf',
  },
];

export function getStoredBills(): Bill[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBills));
      return initialBills;
    }
    return JSON.parse(data) as Bill[];
  } catch {
    return initialBills;
  }
}

export function saveStoredBills(bills: Bill[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch (error) {
    console.error('Failed to save bills in localStorage', error);
  }
}

export function approveBill(billId: string, adminName: string): Bill | null {
  const bills = getStoredBills();
  const billIndex = bills.findIndex((b) => b.id === billId);
  if (billIndex === -1) return null;

  const bill = bills[billIndex];
  if (bill.status !== 'PENDING') return null;

  bill.status = 'APPROVED';
  bill.approvedBy = adminName;
  bill.approvedAt = new Date().toISOString();
  delete bill.rejectionReason;

  bills[billIndex] = bill;
  saveStoredBills(bills);
  return bill;
}

export function rejectBill(billId: string, adminName: string, reason: string): Bill | null {
  const bills = getStoredBills();
  const billIndex = bills.findIndex((b) => b.id === billId);
  if (billIndex === -1) return null;

  const bill = bills[billIndex];
  if (bill.status !== 'PENDING') return null;

  bill.status = 'REJECTED';
  bill.approvedBy = adminName;
  bill.approvedAt = new Date().toISOString();
  bill.rejectionReason = reason;

  bills[billIndex] = bill;
  saveStoredBills(bills);
  return bill;
}

export function recordBillPayment(
  billId: string,
  paymentData: {
    amount: number;
    paymentDate: string;
    mode: PaymentMode;
    referenceNumber?: string;
    remarks?: string;
    recordedBy: string;
  }
): Bill | null {
  const bills = getStoredBills();
  const billIndex = bills.findIndex((b) => b.id === billId);
  if (billIndex === -1) return null;

  const bill = bills[billIndex];
  if (bill.status !== 'APPROVED' && bill.status !== 'PARTIALLY_PAID') return null;
  if (paymentData.amount <= 0 || paymentData.amount > bill.outstandingAmount) return null;

  const newPayment: Payment = {
    id: `PAY-${Date.now().toString().slice(-4)}`,
    billId,
    amount: paymentData.amount,
    paymentDate: paymentData.paymentDate,
    mode: paymentData.mode,
    referenceNumber: paymentData.referenceNumber,
    remarks: paymentData.remarks,
    recordedBy: paymentData.recordedBy,
    createdAt: new Date().toISOString(),
  };

  bill.payments.push(newPayment);
  bill.paidAmount += paymentData.amount;
  bill.outstandingAmount = Math.max(0, bill.totalAmount - bill.paidAmount);

  if (bill.outstandingAmount === 0) {
    bill.status = 'PAID';
  } else {
    bill.status = 'PARTIALLY_PAID';
  }

  bills[billIndex] = bill;
  saveStoredBills(bills);
  return bill;
}

export function addBill(newBillData: Omit<Bill, 'id' | 'paidAmount' | 'outstandingAmount' | 'payments' | 'status' | 'submittedAt' | 'gstAmount' | 'totalAmount'>): Bill {
  const bills = getStoredBills();
  const gstAmount = Math.round((newBillData.baseAmount * (newBillData.gstPercent / 100)) * 100) / 100;
  const totalAmount = newBillData.baseAmount + gstAmount;

  const newBill: Bill = {
    ...newBillData,
    id: `BILL-${String(bills.length + 1).padStart(3, '0')}`,
    gstAmount,
    totalAmount,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    paidAmount: 0,
    outstandingAmount: totalAmount,
    payments: [],
  };

  bills.unshift(newBill);
  saveStoredBills(bills);
  return newBill;
}
