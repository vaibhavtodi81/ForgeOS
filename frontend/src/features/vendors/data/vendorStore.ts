import type { Vendor, Quotation, ProjectContract, NegotiationHistoryItem, QuotationStatus } from '../types/vendor';

const STORAGE_KEY = 'forgeos_vendors';

export const initialVendors: Vendor[] = [
  {
    id: 'VEND-001',
    name: 'UltraTech Cement Ltd',
    category: 'CEMENT',
    contactPerson: 'Rajesh Singhania',
    phone: '+91 98201 44521',
    email: 'r.singhania@adityabirla.com',
    address: 'Aditya Birla Centre, S.K. Ahire Marg, Worli',
    city: 'Mumbai',
    gstin: '07AAACU8044B1Z5',
    panNumber: 'AAACU8044B',
    rating: 4.8,
    status: 'ACTIVE',
    totalContractedValue: 23300000,
    activeQuotationsCount: 1,
    bankDetails: {
      accountName: 'UltraTech Cement Limited',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200018894120',
      ifscCode: 'HDFC0000060',
    },
    contracts: [
      {
        id: 'CTR-001',
        projectId: '1',
        projectCode: 'PRJ-001',
        projectName: 'Green Valley Residency',
        contractNumber: 'CTR-GVR-2026-01',
        title: 'Bulk Supply OPC 53 & Super PPC Cement for Towers A-D',
        category: 'CEMENT',
        contractValue: 14500000,
        startDate: '2026-01-15',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        scopeOfWork: 'Supply of 45,000 bags of OPC 53 and PPC with guaranteed 24hr delivery to Sector 62 site.',
        paymentTerms: '30 days credit cycle against verified delivery challans and lab test certificates.',
      },
      {
        id: 'CTR-002',
        projectId: '2',
        projectCode: 'PRJ-002',
        projectName: 'Skyline Commercial Hub',
        contractNumber: 'CTR-SCH-2026-04',
        title: 'High Performance Cement Supply for Commercial Podium',
        category: 'CEMENT',
        contractValue: 8800000,
        startDate: '2026-02-10',
        endDate: '2027-01-31',
        status: 'ACTIVE',
        scopeOfWork: 'Supply of specialty cementitious binders for deep basement casting and structural slabs.',
        paymentTerms: '45 days credit from date of invoice.',
      },
    ],
    quotations: [
      {
        id: 'QUOTE-UTC-104',
        quotationNumber: 'QT-UTC-2026-104',
        vendorId: 'VEND-001',
        vendorName: 'UltraTech Cement Ltd',
        projectId: '1',
        projectCode: 'PRJ-001',
        projectName: 'Green Valley Residency',
        category: 'CEMENT',
        itemDescription: 'UltraTech Premium OPC 53 Grade Cement (50kg Bag) for Phase 2 Superstructure',
        quantity: 10000,
        unit: 'Bags',
        initialQuotedRate: 375,
        initialTotalAmount: 3750000,
        currentCounterRate: 345,
        builderTargetRate: 340,
        gstRate: 28,
        status: 'UNDER_NEGOTIATION',
        submittedDate: '2026-10-20',
        validTill: '2026-11-30',
        paymentTermsOffered: '21 Days net credit post delivery',
        builderNotes: 'Offered ₹345/bag considering our ongoing 45,000 bags commitment. Target to close at ₹342 with 30 days credit.',
        negotiationHistory: [
          {
            id: 'NEG-001',
            date: '2026-10-20',
            author: 'Rajesh Singhania (UltraTech)',
            role: 'VENDOR',
            offeredRate: 375,
            unit: 'per Bag',
            creditDaysOffered: 21,
            notes: 'Initial quotation submitted based on current clinker freight costs from Kotputli plant.',
          },
          {
            id: 'NEG-002',
            date: '2026-10-24',
            author: 'Builder Admin (ForgeOS)',
            role: 'BUILDER',
            offeredRate: 340,
            unit: 'per Bag',
            creditDaysOffered: 35,
            notes: 'Counter-offer sent. Highlighted bulk multi-site volume across Green Valley and Skyline Hub.',
          },
          {
            id: 'NEG-003',
            date: '2026-10-28',
            author: 'Rajesh Singhania (UltraTech)',
            role: 'VENDOR',
            offeredRate: 352,
            unit: 'per Bag',
            creditDaysOffered: 28,
            notes: 'Revised quotation after regional sales head approval. Ready to absorb unloading freight.',
          },
          {
            id: 'NEG-004',
            date: '2026-11-02',
            author: 'Builder Admin (ForgeOS)',
            role: 'BUILDER',
            offeredRate: 345,
            unit: 'per Bag',
            creditDaysOffered: 30,
            notes: 'Final builder counter-proposal: ₹345/bag including transit insurance and unloading at site.',
          },
        ],
      },
    ],
  },
  {
    id: 'VEND-002',
    name: 'Tata Steel Ltd (Tiscon)',
    category: 'STEEL',
    contactPerson: 'Vikram Malhotra',
    phone: '+91 98112 99823',
    email: 'v.malhotra@tatasteel.com',
    address: 'Tata Centre, 43 Jawaharlal Nehru Road',
    city: 'Delhi NCR',
    gstin: '07AAACT2727Q1ZT',
    panNumber: 'AAACT2727Q',
    rating: 4.9,
    status: 'ACTIVE',
    totalContractedValue: 39500000,
    activeQuotationsCount: 1,
    bankDetails: {
      accountName: 'Tata Steel Limited',
      bankName: 'State Bank of India',
      accountNumber: '10998845123',
      ifscCode: 'SBIN0000691',
    },
    contracts: [
      {
        id: 'CTR-003',
        projectId: '1',
        projectCode: 'PRJ-001',
        projectName: 'Green Valley Residency',
        contractNumber: 'CTR-GVR-2026-02',
        title: 'Primary Reinforcement Fe500D TMT Rebars Supply (450 MT)',
        category: 'STEEL',
        contractValue: 27500000,
        startDate: '2026-01-20',
        endDate: '2026-11-30',
        status: 'ACTIVE',
        scopeOfWork: 'Certified primary steel rebars 8mm to 32mm with mill test certificates and weight-bridge slips.',
        paymentTerms: 'Payment within 30 days of weigh-bridge verification and delivery challan sign-off.',
      },
      {
        id: 'CTR-004',
        projectId: '3',
        projectCode: 'PRJ-003',
        projectName: 'Riverside Heights',
        contractNumber: 'CTR-RSH-2025-08',
        title: 'Reinforcement TMT Steel Supply Phase 2',
        category: 'STEEL',
        contractValue: 12000000,
        startDate: '2025-06-15',
        endDate: '2026-08-30',
        status: 'COMPLETED',
        scopeOfWork: 'Supply of 200 MT structural steel for residential wings completed successfully.',
        paymentTerms: 'Full settlement completed.',
      },
    ],
    quotations: [
      {
        id: 'QUOTE-TSL-088',
        quotationNumber: 'QT-TSL-2026-088',
        vendorId: 'VEND-002',
        vendorName: 'Tata Steel Ltd (Tiscon)',
        projectId: '2',
        projectCode: 'PRJ-002',
        projectName: 'Skyline Commercial Hub',
        category: 'STEEL',
        itemDescription: 'Tata Tiscon 550D High Ductility Earthquake Resistant TMT Bars (16mm, 20mm, 25mm)',
        quantity: 200,
        unit: 'MT',
        initialQuotedRate: 64000,
        initialTotalAmount: 12800000,
        currentCounterRate: 61800,
        builderTargetRate: 60000,
        gstRate: 18,
        status: 'COUNTER_OFFERED',
        submittedDate: '2026-10-18',
        validTill: '2026-11-25',
        paymentTermsOffered: '15 Days against dispatch weighment',
        builderNotes: 'Market benchmark for secondary steel is ₹54,000/MT, but Tata Tiscon primary brand justifies ₹60,500/MT for commercial high-rise.',
        negotiationHistory: [
          {
            id: 'NEG-010',
            date: '2026-10-18',
            author: 'Vikram Malhotra (Tata Steel)',
            role: 'VENDOR',
            offeredRate: 64000,
            unit: 'per MT',
            creditDaysOffered: 15,
            notes: 'Initial mill gate price quoted with freight to Delhi Okhla stockyard.',
          },
          {
            id: 'NEG-011',
            date: '2026-10-22',
            author: 'Builder Admin (ForgeOS)',
            role: 'BUILDER',
            offeredRate: 60500,
            unit: 'per MT',
            creditDaysOffered: 30,
            notes: 'Requested volume rebate of ₹3,500/MT with standard 30-day payment term.',
          },
          {
            id: 'NEG-012',
            date: '2026-10-30',
            author: 'Vikram Malhotra (Tata Steel)',
            role: 'VENDOR',
            offeredRate: 61800,
            unit: 'per MT',
            creditDaysOffered: 25,
            notes: 'Revised quote. Can offer ₹61,800/MT if ordered in lots of 50 MT minimum per delivery.',
          },
        ],
      },
    ],
  },
  {
    id: 'VEND-003',
    name: 'ACC ReadyMix Concrete (RMC)',
    category: 'READY_MIX_CONCRETE',
    contactPerson: 'Sunil Kulkarni',
    phone: '+91 98450 33219',
    email: 'sunil.k@acclimited.com',
    address: 'Udyog Vihar Phase 4, Plot 88',
    city: 'Gurugram',
    gstin: '06AAACA0544C1Z9',
    panNumber: 'AAACA0544C',
    rating: 4.6,
    status: 'ACTIVE',
    totalContractedValue: 25000000,
    activeQuotationsCount: 1,
    bankDetails: {
      accountName: 'ACC Concrete Products Ltd',
      bankName: 'ICICI Bank',
      accountNumber: '002105009844',
      ifscCode: 'ICIC0000021',
    },
    contracts: [
      {
        id: 'CTR-005',
        projectId: '2',
        projectCode: 'PRJ-002',
        projectName: 'Skyline Commercial Hub',
        contractNumber: 'CTR-SCH-2026-06',
        title: 'M35 & M40 Design Mix RMC Supply with Transit Mixers & Boom Placer',
        category: 'READY_MIX_CONCRETE',
        contractValue: 18500000,
        startDate: '2026-02-15',
        endDate: '2027-02-28',
        status: 'ACTIVE',
        scopeOfWork: 'Continuous concrete pour batches with 36m concrete boom pump allocation.',
        paymentTerms: 'Bi-weekly billing based on automated batching plant computerized receipts.',
      },
      {
        id: 'CTR-006',
        projectId: '4',
        projectCode: 'PRJ-004',
        projectName: 'Urban Square',
        contractNumber: 'CTR-USQ-2026-01',
        title: 'Foundation Raft Concrete M30 Pouring Batch 1',
        category: 'READY_MIX_CONCRETE',
        contractValue: 6500000,
        startDate: '2026-09-01',
        endDate: '2027-03-31',
        status: 'ACTIVE',
        scopeOfWork: '1,500 Cu.M continuous raft foundation casting with cube testing reports.',
        paymentTerms: '20% advance, balance 80% on 30-day cycle post pouring.',
      },
    ],
    quotations: [
      {
        id: 'QUOTE-ACC-031',
        quotationNumber: 'QT-ACC-2026-031',
        vendorId: 'VEND-003',
        vendorName: 'ACC ReadyMix Concrete (RMC)',
        projectId: '1',
        projectCode: 'PRJ-001',
        projectName: 'Green Valley Residency',
        category: 'READY_MIX_CONCRETE',
        itemDescription: 'M35 Grade High-Performance Self-Compacting Concrete (1,200 Cu.M)',
        quantity: 1200,
        unit: 'Cu.M',
        initialQuotedRate: 4650,
        initialTotalAmount: 5580000,
        currentCounterRate: 4300,
        finalAgreedRate: 4300,
        builderTargetRate: 4300,
        gstRate: 18,
        status: 'ACCEPTED',
        submittedDate: '2026-10-05',
        validTill: '2026-11-15',
        paymentTermsOffered: '30 Days credit with slump retention guarantee',
        builderNotes: 'Successfully negotiated down by ₹350/Cu.M (saving ₹4.2 Lakhs). Contract ready for drafting.',
        negotiationHistory: [
          {
            id: 'NEG-020',
            date: '2026-10-05',
            author: 'Sunil Kulkarni (ACC)',
            role: 'VENDOR',
            offeredRate: 4650,
            unit: 'per Cu.M',
            creditDaysOffered: 15,
            notes: 'Quote inclusive of fly ash blend and superplasticizer for 3-hour slump life.',
          },
          {
            id: 'NEG-021',
            date: '2026-10-09',
            author: 'Builder Admin (ForgeOS)',
            role: 'BUILDER',
            offeredRate: 4250,
            unit: 'per Cu.M',
            creditDaysOffered: 30,
            notes: 'Countered based on proximity of ACC Manesar batching plant (11 km from site).',
          },
          {
            id: 'NEG-022',
            date: '2026-10-12',
            author: 'Sunil Kulkarni (ACC)',
            role: 'VENDOR',
            offeredRate: 4300,
            unit: 'per Cu.M',
            creditDaysOffered: 30,
            notes: 'Agreed on ₹4,300/Cu.M with dedicated pump operator on day of casting.',
          },
        ],
      },
    ],
  },
  {
    id: 'VEND-004',
    name: 'Schneider Electric India Pvt Ltd',
    category: 'ELECTRICAL',
    contactPerson: 'Ananya Sen',
    phone: '+91 98233 11882',
    email: 'ananya.sen@se.com',
    address: 'Electra Tower, Cyber City Phase 2',
    city: 'Gurugram',
    gstin: '09AAACS9821L1Z4',
    panNumber: 'AAACS9821L',
    rating: 4.7,
    status: 'ACTIVE',
    totalContractedValue: 9200000,
    activeQuotationsCount: 1,
    bankDetails: {
      accountName: 'Schneider Electric India Pvt Ltd',
      bankName: 'Citibank N.A.',
      accountNumber: '0349887102',
      ifscCode: 'CITI0000002',
    },
    contracts: [
      {
        id: 'CTR-007',
        projectId: '1',
        projectCode: 'PRJ-001',
        projectName: 'Green Valley Residency',
        contractNumber: 'CTR-GVR-2026-07',
        title: 'LT Distribution Panels, Transformers & Busduct Supply',
        category: 'ELECTRICAL',
        contractValue: 9200000,
        startDate: '2026-03-01',
        endDate: '2026-11-30',
        status: 'ACTIVE',
        scopeOfWork: 'Main distribution panels, Schneider ACB 1600A, and rising mains for Towers A & B.',
        paymentTerms: '30% advance on GA drawing sign-off, 60% on factory dispatch, 10% on commissioning.',
      },
    ],
    quotations: [
      {
        id: 'QUOTE-SEI-512',
        quotationNumber: 'QT-SEI-2026-512',
        vendorId: 'VEND-004',
        vendorName: 'Schneider Electric India Pvt Ltd',
        projectId: '2',
        projectCode: 'PRJ-002',
        projectName: 'Skyline Commercial Hub',
        category: 'ELECTRICAL',
        itemDescription: 'Smart Energy Management Sub-Meters, Modbus Gateways & Capacitor Bank Panels',
        quantity: 1,
        unit: 'Package',
        initialQuotedRate: 3850000,
        initialTotalAmount: 3850000,
        currentCounterRate: 3500000,
        builderTargetRate: 3400000,
        gstRate: 18,
        status: 'UNDER_NEGOTIATION',
        submittedDate: '2026-10-25',
        validTill: '2026-12-10',
        paymentTermsOffered: '20% Advance, 80% on delivery against LC or PDC',
        builderNotes: 'Discussing with regional engineering manager to include free 3-year SCADA cloud monitoring license.',
        negotiationHistory: [
          {
            id: 'NEG-030',
            date: '2026-10-25',
            author: 'Ananya Sen (Schneider)',
            role: 'VENDOR',
            offeredRate: 3850000,
            unit: 'Package',
            creditDaysOffered: 15,
            notes: 'Premium commercial tier smart panels with IoT wireless energy metering.',
          },
          {
            id: 'NEG-031',
            date: '2026-10-29',
            author: 'Builder Admin (ForgeOS)',
            role: 'BUILDER',
            offeredRate: 3400000,
            unit: 'Package',
            creditDaysOffered: 45,
            notes: 'Countered with competitive quotation from L&T Electricals for equivalent specs.',
          },
          {
            id: 'NEG-032',
            date: '2026-11-04',
            author: 'Ananya Sen (Schneider)',
            role: 'VENDOR',
            offeredRate: 3580000,
            unit: 'Package',
            creditDaysOffered: 30,
            notes: 'Offered special builder discount of 7% plus extended warranty to 36 months.',
          },
        ],
      },
    ],
  },
  {
    id: 'VEND-005',
    name: 'Astral Pipes Ltd',
    category: 'PLUMBING',
    contactPerson: 'Deepen Parekh',
    phone: '+91 97240 66512',
    email: 'd.parekh@astralpipes.com',
    address: 'Astral House, 207/1 Rajpath Rangoli Road',
    city: 'Ahmedabad',
    gstin: '24AABCA5463J1Z8',
    panNumber: 'AABCA5463J',
    rating: 4.8,
    status: 'ACTIVE',
    totalContractedValue: 5800000,
    activeQuotationsCount: 1,
    bankDetails: {
      accountName: 'Astral Limited',
      bankName: 'Kotak Mahindra Bank',
      accountNumber: '4410982311',
      ifscCode: 'KKBK0000451',
    },
    contracts: [
      {
        id: 'CTR-008',
        projectId: '2',
        projectCode: 'PRJ-002',
        projectName: 'Skyline Commercial Hub',
        contractNumber: 'CTR-SCH-2026-09',
        title: 'CPVC Pro & DrainMaster SWR Piping Network for 18 Floors',
        category: 'PLUMBING',
        contractValue: 5800000,
        startDate: '2026-03-10',
        endDate: '2027-01-20',
        status: 'ACTIVE',
        scopeOfWork: 'Complete internal and vertical stack plumbing supply with solvent cements and rubber ring joints.',
        paymentTerms: '30 days credit from invoice submission and site delivery acknowledgement.',
      },
    ],
    quotations: [
      {
        id: 'QUOTE-AST-219',
        quotationNumber: 'QT-AST-2026-219',
        vendorId: 'VEND-005',
        vendorName: 'Astral Pipes Ltd',
        projectId: '3',
        projectCode: 'PRJ-003',
        projectName: 'Riverside Heights',
        category: 'PLUMBING',
        itemDescription: 'Astral Silencio Low Noise Acoustic Drainage Pipes & Fittings (Phase 3)',
        quantity: 1,
        unit: 'Lot',
        initialQuotedRate: 2200000,
        initialTotalAmount: 2200000,
        currentCounterRate: 1950000,
        builderTargetRate: 1900000,
        gstRate: 18,
        status: 'UNDER_NEGOTIATION',
        submittedDate: '2026-10-15',
        validTill: '2026-11-20',
        paymentTermsOffered: '30 Days credit',
        builderNotes: 'Negotiating with distributor for direct mill pricing on large lot size.',
        negotiationHistory: [
          {
            id: 'NEG-040',
            date: '2026-10-15',
            author: 'Deepen Parekh (Astral)',
            role: 'VENDOR',
            offeredRate: 2200000,
            unit: 'Lot',
            creditDaysOffered: 21,
            notes: 'High acoustic insulation triple-layer pipes directly dispatched from Santej plant.',
          },
          {
            id: 'NEG-041',
            date: '2026-10-21',
            author: 'Builder Admin (ForgeOS)',
            role: 'BUILDER',
            offeredRate: 1950000,
            unit: 'Lot',
            creditDaysOffered: 45,
            notes: 'Countered with target rate of ₹19.5 Lakhs and 45 days payment cycle.',
          },
        ],
      },
    ],
  },
  {
    id: 'VEND-006',
    name: 'Devcon Earthmovers & Shoring',
    category: 'EARTHWORK',
    contactPerson: 'Hardeep Singh',
    phone: '+91 98140 77123',
    email: 'devcon.excavation@gmail.com',
    address: 'Plot 14, Transport Nagar, Ajmer Road',
    city: 'Jaipur',
    gstin: '08AAACD4412E1Z2',
    panNumber: 'AAACD4412E',
    rating: 4.4,
    status: 'ACTIVE',
    totalContractedValue: 4800000,
    activeQuotationsCount: 0,
    bankDetails: {
      accountName: 'Devcon Earthmovers Partnership',
      bankName: 'Axis Bank',
      accountNumber: '918020044558',
      ifscCode: 'UTIB0000140',
    },
    contracts: [
      {
        id: 'CTR-009',
        projectId: '4',
        projectCode: 'PRJ-004',
        projectName: 'Urban Square',
        contractNumber: 'CTR-USQ-2026-03',
        title: 'Double Basement Excavation, Rock Breaking & Soil Disposal (45,000 Cu.M)',
        category: 'EARTHWORK',
        contractValue: 4800000,
        startDate: '2026-09-05',
        endDate: '2026-12-15',
        status: 'ACTIVE',
        scopeOfWork: 'Hydraulic breaker deployment, 6 JCB excavators, 12 dumper trucks, and municipal dumping clearance.',
        paymentTerms: 'Weekly running account (RA) bills against verified surveyor cross-sections.',
      },
    ],
    quotations: [],
  },
  {
    id: 'VEND-007',
    name: 'Asian Paints Pro Contracting',
    category: 'FINISHING',
    contactPerson: 'Meera Nair',
    phone: '+91 98920 55431',
    email: 'pro.delhi@asianpaints.com',
    address: '6A Shanti Nagar, Santacruz East',
    city: 'Delhi NCR',
    gstin: '07AAACA4743B1ZB',
    panNumber: 'AAACA4743B',
    rating: 4.9,
    status: 'ACTIVE',
    totalContractedValue: 0,
    activeQuotationsCount: 1,
    bankDetails: {
      accountName: 'Asian Paints Limited',
      bankName: 'State Bank of India',
      accountNumber: '30099441209',
      ifscCode: 'SBIN0000412',
    },
    contracts: [],
    quotations: [
      {
        id: 'QUOTE-AP-301',
        quotationNumber: 'QT-AP-2026-301',
        vendorId: 'VEND-007',
        vendorName: 'Asian Paints Pro Contracting',
        projectId: '1',
        projectCode: 'PRJ-001',
        projectName: 'Green Valley Residency',
        category: 'FINISHING',
        itemDescription: 'Exterior Apex Ultima Protek with 10-Year Warranty & Internal Royale Luxury Emulsion Application (3,50,000 Sq.Ft)',
        quantity: 350000,
        unit: 'Sq.Ft',
        initialQuotedRate: 22,
        initialTotalAmount: 7700000,
        currentCounterRate: 20,
        builderTargetRate: 19.5,
        gstRate: 18,
        status: 'UNDER_NEGOTIATION',
        submittedDate: '2026-10-28',
        validTill: '2026-12-05',
        paymentTermsOffered: 'Stage-wise milestone payments based on facade completion',
        builderNotes: 'Pushing for ₹19.5/Sq.Ft inclusive of 2 coats of exterior wall primer and scaffolding setup.',
        negotiationHistory: [
          {
            id: 'NEG-050',
            date: '2026-10-28',
            author: 'Meera Nair (Asian Paints)',
            role: 'VENDOR',
            offeredRate: 22,
            unit: 'per Sq.Ft',
            creditDaysOffered: 15,
            notes: 'Turnkey quote with certified applicator crew and 10-year anti-fungal manufacturer warranty.',
          },
          {
            id: 'NEG-051',
            date: '2026-11-03',
            author: 'Builder Admin (ForgeOS)',
            role: 'BUILDER',
            offeredRate: 19.5,
            unit: 'per Sq.Ft',
            creditDaysOffered: 30,
            notes: 'Offered ₹19.5/Sq.Ft considering huge 3.5 Lakh sq ft facade area across 4 towers.',
          },
          {
            id: 'NEG-052',
            date: '2026-11-07',
            author: 'Meera Nair (Asian Paints)',
            role: 'VENDOR',
            offeredRate: 20.2,
            unit: 'per Sq.Ft',
            creditDaysOffered: 25,
            notes: 'Revised quote. Offers ₹20.2/Sq.Ft with complimentary damp-proofing evaluation for terrace parapets.',
          },
        ],
      },
    ],
  },
];

export function getStoredVendors(): Vendor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialVendors));
      return initialVendors;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialVendors));
    return initialVendors;
  } catch (err) {
    console.error('Failed to load vendors from storage:', err);
    return initialVendors;
  }
}

export function saveStoredVendors(vendors: Vendor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
  } catch (err) {
    console.error('Failed to save vendors to storage:', err);
  }
}

export function addVendor(vendorData: Omit<Vendor, 'id' | 'contracts' | 'quotations' | 'totalContractedValue' | 'activeQuotationsCount'>): Vendor {
  const vendors = getStoredVendors();
  const newVendor: Vendor = {
    ...vendorData,
    id: `VEND-${String(vendors.length + 1).padStart(3, '0')}`,
    contracts: [],
    quotations: [],
    totalContractedValue: 0,
    activeQuotationsCount: 0,
  };

  vendors.unshift(newVendor);
  saveStoredVendors(vendors);
  return newVendor;
}

export function recordNegotiationRound(
  quotationId: string,
  newCounterRate: number,
  notes: string,
  newStatus: QuotationStatus = 'UNDER_NEGOTIATION'
): Quotation | null {
  const vendors = getStoredVendors();
  let updatedQuote: Quotation | null = null;

  for (const vendor of vendors) {
    const qIndex = vendor.quotations.findIndex((q) => q.id === quotationId);
    if (qIndex !== -1) {
      const q = vendor.quotations[qIndex];
      const newHistoryItem: NegotiationHistoryItem = {
        id: `NEG-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        author: 'Builder Admin (ForgeOS)',
        role: 'BUILDER',
        offeredRate: newCounterRate,
        unit: `per ${q.unit}`,
        creditDaysOffered: 30,
        notes: notes.trim() || 'Counter-offer proposed by Builder during price discovery.',
      };

      q.currentCounterRate = newCounterRate;
      q.status = newStatus;
      q.negotiationHistory.push(newHistoryItem);
      q.builderNotes = notes;

      vendor.quotations[qIndex] = q;
      updatedQuote = q;
      break;
    }
  }

  if (updatedQuote) {
    saveStoredVendors(vendors);
  }
  return updatedQuote;
}

export function acceptQuotation(quotationId: string, finalAgreedRate: number): Quotation | null {
  const vendors = getStoredVendors();
  let updatedQuote: Quotation | null = null;

  for (const vendor of vendors) {
    const qIndex = vendor.quotations.findIndex((q) => q.id === quotationId);
    if (qIndex !== -1) {
      const q = vendor.quotations[qIndex];
      q.status = 'ACCEPTED';
      q.finalAgreedRate = finalAgreedRate;
      q.negotiationHistory.push({
        id: `NEG-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        author: 'Builder Admin (ForgeOS)',
        role: 'BUILDER',
        offeredRate: finalAgreedRate,
        unit: `per ${q.unit}`,
        notes: `Quotation finalized and accepted at negotiated rate ₹${finalAgreedRate.toLocaleString('en-IN')}/${q.unit}. Prepared for contract execution.`,
      });

      // Also create an active contract for this vendor on the project!
      const contractValue = finalAgreedRate * q.quantity;
      const newContract: ProjectContract = {
        id: `CTR-${Date.now().toString().slice(-4)}`,
        projectId: q.projectId,
        projectCode: q.projectCode,
        projectName: q.projectName,
        contractNumber: `CTR-${q.projectCode}-${new Date().getFullYear()}-${String(vendor.contracts.length + 1).padStart(2, '0')}`,
        title: `${q.itemDescription.slice(0, 50)}... Supply Agreement`,
        category: q.category,
        contractValue,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'ACTIVE',
        scopeOfWork: `Agreed supply of ${q.quantity} ${q.unit} of ${q.itemDescription} at finalized rate of ₹${finalAgreedRate}/${q.unit}.`,
        paymentTerms: q.paymentTermsOffered || '30 days net credit against verified challans.',
      };

      vendor.contracts.unshift(newContract);
      vendor.totalContractedValue += contractValue;
      if (vendor.activeQuotationsCount > 0) {
        vendor.activeQuotationsCount -= 1;
      }

      vendor.quotations[qIndex] = q;
      updatedQuote = q;
      break;
    }
  }

  if (updatedQuote) {
    saveStoredVendors(vendors);
  }
  return updatedQuote;
}

export function rejectQuotation(quotationId: string, reason: string): Quotation | null {
  const vendors = getStoredVendors();
  let updatedQuote: Quotation | null = null;

  for (const vendor of vendors) {
    const qIndex = vendor.quotations.findIndex((q) => q.id === quotationId);
    if (qIndex !== -1) {
      const q = vendor.quotations[qIndex];
      q.status = 'REJECTED';
      q.negotiationHistory.push({
        id: `NEG-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        author: 'Builder Admin (ForgeOS)',
        role: 'BUILDER',
        offeredRate: q.currentCounterRate || q.initialQuotedRate,
        unit: `per ${q.unit}`,
        notes: `Negotiation closed / Rejected: ${reason}`,
      });
      if (vendor.activeQuotationsCount > 0) {
        vendor.activeQuotationsCount -= 1;
      }
      vendor.quotations[qIndex] = q;
      updatedQuote = q;
      break;
    }
  }

  if (updatedQuote) {
    saveStoredVendors(vendors);
  }
  return updatedQuote;
}

export function addQuotationToVendor(
  vendorId: string,
  quoteData: Omit<Quotation, 'id' | 'vendorName' | 'status' | 'negotiationHistory'>
): Quotation | null {
  const vendors = getStoredVendors();
  const vIndex = vendors.findIndex((v) => v.id === vendorId);
  if (vIndex === -1) return null;

  const vendor = vendors[vIndex];
  const newQuotation: Quotation = {
    ...quoteData,
    id: `QUOTE-${Date.now().toString().slice(-5)}`,
    vendorName: vendor.name,
    status: 'SUBMITTED',
    negotiationHistory: [
      {
        id: `NEG-INIT-${Date.now().toString().slice(-4)}`,
        date: quoteData.submittedDate || new Date().toISOString().split('T')[0],
        author: `${vendor.contactPerson} (${vendor.name})`,
        role: 'VENDOR',
        offeredRate: quoteData.initialQuotedRate,
        unit: `per ${quoteData.unit}`,
        notes: 'Initial quotation submitted for review.',
      },
    ],
  };

  vendor.quotations.unshift(newQuotation);
  vendor.activeQuotationsCount += 1;
  vendors[vIndex] = vendor;
  saveStoredVendors(vendors);
  return newQuotation;
}
