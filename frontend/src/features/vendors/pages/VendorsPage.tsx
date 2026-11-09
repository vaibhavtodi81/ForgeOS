import { useState, useMemo } from 'react';
import {
  UsersRound,
  Plus,
  Search,
  Building2,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingDown,
  Handshake,
  MessageSquare,
  ShieldCheck,
  Star,
  Receipt,
} from 'lucide-react';
import { AppShell } from '../../app-shell/components/AppShell';
import { isAdmin } from '../../authentication/utils/permissions';
import {
  getStoredVendors,
  addVendor,
  recordNegotiationRound,
  acceptQuotation,
  rejectQuotation,
  addQuotationToVendor,
} from '../data/vendorStore';
import type {
  Vendor,
  Quotation,
  VendorCategory,
  QuotationStatus,
} from '../types/vendor';

const PROJECTS = [
  { id: '1', code: 'PRJ-001', name: 'Green Valley Residency' },
  { id: '2', code: 'PRJ-002', name: 'Skyline Commercial Hub' },
  { id: '3', code: 'PRJ-003', name: 'Riverside Heights' },
  { id: '4', code: 'PRJ-004', name: 'Urban Square' },
];

const CATEGORIES: { label: string; value: VendorCategory }[] = [
  { label: 'Cement', value: 'CEMENT' },
  { label: 'Steel & Rebars', value: 'STEEL' },
  { label: 'Ready-Mix Concrete (RMC)', value: 'READY_MIX_CONCRETE' },
  { label: 'Electrical & Panels', value: 'ELECTRICAL' },
  { label: 'Plumbing & Drainage', value: 'PLUMBING' },
  { label: 'Earthwork & Shoring', value: 'EARTHWORK' },
  { label: 'Finishing & Paints', value: 'FINISHING' },
  { label: 'Labour Contractor', value: 'LABOUR_CONTRACTOR' },
  { label: 'Equipment Rental', value: 'EQUIPMENT_RENTAL' },
  { label: 'Other', value: 'OTHER' },
];

function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

function getStatusBadge(status: QuotationStatus) {
  switch (status) {
    case 'ACCEPTED':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Accepted / Contracted',
      };
    case 'COUNTER_OFFERED':
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        label: 'Counter-Offered',
      };
    case 'UNDER_NEGOTIATION':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Under Negotiation',
      };
    case 'REJECTED':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        label: 'Rejected',
      };
    case 'SUBMITTED':
    default:
      return {
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        label: 'New Quote',
      };
  }
}

export function VendorsPage() {
  const admin = isAdmin();
  const [vendors, setVendors] = useState<Vendor[]>(() => getStoredVendors());

  // Views: 'VENDORS' (Directory & Contracts), 'NEGOTIATIONS' (Quotes & Counter-offers), 'BY_PROJECT'
  const [activeTab, setActiveTab] = useState<'VENDORS' | 'NEGOTIATIONS' | 'BY_PROJECT'>('NEGOTIATIONS');

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedQuoteStatus, setSelectedQuoteStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'NEGOTIATE' | 'VIEW_VENDOR' | 'ADD_VENDOR' | 'NEW_QUOTE' | null
  >(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Negotiation Modal Inputs
  const [counterRateInput, setCounterRateInput] = useState<string>('');
  const [negotiationNotes, setNegotiationNotes] = useState<string>('');
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  // New Vendor Form
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState<VendorCategory>('CEMENT');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newGstin, setNewGstin] = useState('');

  // New Quote Form
  const [newQuoteVendorId, setNewQuoteVendorId] = useState('');
  const [newQuoteProjectId, setNewQuoteProjectId] = useState('1');
  const [newQuoteCategory, setNewQuoteCategory] = useState<VendorCategory>('CEMENT');
  const [newQuoteDescription, setNewQuoteDescription] = useState('');
  const [newQuoteQuantity, setNewQuoteQuantity] = useState('');
  const [newQuoteUnit, setNewQuoteUnit] = useState('Bags');
  const [newQuoteRate, setNewQuoteRate] = useState('');
  const [newQuoteTargetRate, setNewQuoteTargetRate] = useState('');
  const [newQuoteGst, setNewQuoteGst] = useState('18');
  const [newQuotePaymentTerms, setNewQuotePaymentTerms] = useState('30 Days credit');

  // Flattened quotations list across all vendors
  const allQuotations = useMemo(() => {
    return vendors.flatMap((v) => v.quotations);
  }, [vendors]);

  // Overall KPI Calculations
  const kpis = useMemo(() => {
    const totalVendorsCount = vendors.length;
    let totalContractsCount = 0;
    let totalContractValue = 0;
    let activeNegotiationsCount = 0;
    let totalNegotiationSavings = 0;

    for (const v of vendors) {
      totalContractsCount += v.contracts.length;
      totalContractValue += v.totalContractedValue;
      for (const q of v.quotations) {
        if (q.status === 'UNDER_NEGOTIATION' || q.status === 'COUNTER_OFFERED' || q.status === 'SUBMITTED') {
          activeNegotiationsCount++;
        }
        // If counter rate or final agreed rate exists, calculate saving
        const benchmarkRate = q.finalAgreedRate || q.currentCounterRate;
        if (benchmarkRate && benchmarkRate < q.initialQuotedRate) {
          totalNegotiationSavings += (q.initialQuotedRate - benchmarkRate) * q.quantity;
        }
      }
    }

    return {
      totalVendorsCount,
      totalContractsCount,
      totalContractValue,
      activeNegotiationsCount,
      totalNegotiationSavings,
    };
  }, [vendors]);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return allQuotations.filter((q) => {
      if (selectedProjectId !== 'ALL' && q.projectId !== selectedProjectId) return false;
      if (selectedCategory !== 'ALL' && q.category !== selectedCategory) return false;
      if (selectedQuoteStatus !== 'ALL' && q.status !== selectedQuoteStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          q.vendorName.toLowerCase().includes(query) ||
          q.quotationNumber.toLowerCase().includes(query) ||
          q.projectName.toLowerCase().includes(query) ||
          q.itemDescription.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [allQuotations, selectedProjectId, selectedCategory, selectedQuoteStatus, searchQuery]);

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (selectedCategory !== 'ALL' && v.category !== selectedCategory) return false;
      if (selectedProjectId !== 'ALL') {
        const hasProject =
          v.contracts.some((c) => c.projectId === selectedProjectId) ||
          v.quotations.some((q) => q.projectId === selectedProjectId);
        if (!hasProject) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          v.name.toLowerCase().includes(query) ||
          v.contactPerson.toLowerCase().includes(query) ||
          v.city.toLowerCase().includes(query) ||
          v.gstin.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [vendors, selectedCategory, selectedProjectId, searchQuery]);

  // Handlers for negotiation
  const handleOpenNegotiation = (quote: Quotation) => {
    setSelectedQuote(quote);
    setCounterRateInput(quote.currentCounterRate?.toString() || quote.builderTargetRate?.toString() || '');
    setNegotiationNotes('');
    setIsRejecting(false);
    setRejectReasonInput('');
    setActiveModal('NEGOTIATE');
  };

  const handleOpenVendorDetail = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setActiveModal('VIEW_VENDOR');
  };

  const handleOpenAddVendor = () => {
    setNewVendorName('');
    setNewVendorCategory('CEMENT');
    setNewContactPerson('');
    setNewPhone('');
    setNewEmail('');
    setNewCity('');
    setNewAddress('');
    setNewGstin('');
    setActiveModal('ADD_VENDOR');
  };

  const handleOpenNewQuote = () => {
    if (vendors.length > 0) {
      setNewQuoteVendorId(vendors[0].id);
      setNewQuoteCategory(vendors[0].category);
    }
    setNewQuoteProjectId('1');
    setNewQuoteDescription('');
    setNewQuoteQuantity('');
    setNewQuoteUnit('Bags');
    setNewQuoteRate('');
    setNewQuoteTargetRate('');
    setNewQuoteGst('18');
    setNewQuotePaymentTerms('30 Days credit');
    setActiveModal('NEW_QUOTE');
  };

  const handleSubmitCounterOffer = () => {
    if (!selectedQuote) return;
    const rate = parseFloat(counterRateInput);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid counter rate.');
      return;
    }

    recordNegotiationRound(
      selectedQuote.id,
      rate,
      negotiationNotes || `Builder counter-offer of ₹${rate.toLocaleString('en-IN')}/${selectedQuote.unit}.`,
      'COUNTER_OFFERED'
    );

    const refreshed = getStoredVendors();
    setVendors(refreshed);
    // update current selected quote in modal
    const updated = refreshed.flatMap((v) => v.quotations).find((q) => q.id === selectedQuote.id);
    if (updated) setSelectedQuote(updated);
    setNegotiationNotes('');
  };

  const handleAcceptNegotiation = () => {
    if (!selectedQuote) return;
    const finalRate = parseFloat(counterRateInput) || selectedQuote.currentCounterRate || selectedQuote.initialQuotedRate;

    const confirmed = window.confirm(
      `Confirm acceptance of quotation at ₹${finalRate.toLocaleString('en-IN')}/${selectedQuote.unit}?\nThis will create an active Project Contract for ${selectedQuote.projectName}.`
    );
    if (!confirmed) return;

    acceptQuotation(selectedQuote.id, finalRate);
    setVendors(getStoredVendors());
    setActiveModal(null);
  };

  const handleRejectQuotationSubmit = () => {
    if (!selectedQuote) return;
    if (!rejectReasonInput.trim()) {
      alert('Please state a reason for closing or rejecting the quotation.');
      return;
    }

    rejectQuotation(selectedQuote.id, rejectReasonInput.trim());
    setVendors(getStoredVendors());
    setActiveModal(null);
  };

  const handleSaveNewVendor = () => {
    if (!newVendorName.trim() || !newContactPerson.trim()) {
      alert('Please enter Vendor Name and Contact Person.');
      return;
    }

    addVendor({
      name: newVendorName.trim(),
      category: newVendorCategory,
      contactPerson: newContactPerson.trim(),
      phone: newPhone.trim() || '+91 98000 00000',
      email: newEmail.trim() || 'info@vendor.com',
      city: newCity.trim() || 'New Delhi',
      address: newAddress.trim() || 'Industrial Area',
      gstin: newGstin.trim().toUpperCase() || '07AAAAA0000A1Z5',
      rating: 4.5,
      status: 'ACTIVE',
    });

    setVendors(getStoredVendors());
    setActiveModal(null);
  };

  const handleSaveNewQuote = () => {
    if (!newQuoteVendorId || !newQuoteDescription.trim()) {
      alert('Please fill out all mandatory quote fields.');
      return;
    }
    const qty = parseFloat(newQuoteQuantity);
    const rate = parseFloat(newQuoteRate);
    if (isNaN(qty) || qty <= 0 || isNaN(rate) || rate <= 0) {
      alert('Please provide valid quantity and unit rate.');
      return;
    }

    const matchedProject = PROJECTS.find((p) => p.id === newQuoteProjectId) || PROJECTS[0];
    const initialTotal = qty * rate;

    addQuotationToVendor(newQuoteVendorId, {
      quotationNumber: `QT-${Date.now().toString().slice(-4)}`,
      vendorId: newQuoteVendorId,
      projectId: matchedProject.id,
      projectCode: matchedProject.code,
      projectName: matchedProject.name,
      category: newQuoteCategory,
      itemDescription: newQuoteDescription.trim(),
      quantity: qty,
      unit: newQuoteUnit,
      initialQuotedRate: rate,
      initialTotalAmount: initialTotal,
      currentCounterRate: newQuoteTargetRate ? parseFloat(newQuoteTargetRate) : undefined,
      builderTargetRate: newQuoteTargetRate ? parseFloat(newQuoteTargetRate) : undefined,
      gstRate: parseInt(newQuoteGst, 10),
      submittedDate: new Date().toISOString().split('T')[0],
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTermsOffered: newQuotePaymentTerms,
      builderNotes: 'Initial quote recorded by Builder procurement desk.',
    });

    setVendors(getStoredVendors());
    setActiveModal(null);
  };

  return (
    <AppShell currentPath="/app/vendors">
      <div className="mx-auto max-w-[1600px] space-y-6 p-5 sm:p-7 lg:p-8">
        {/* Page Header */}
        <div>
          <p className="text-sm text-[#8E827A]">Workspace / Procurement</p>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#323232] sm:text-3xl">
                Vendor Contracts & Quotation Negotiations
              </h1>
              <p className="text-sm text-[#8E827A] mt-1 font-light">
                Builder control center for contracted project suppliers, rate discovery, and multi-round price negotiations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenNewQuote}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[#E8E0DA] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#323232] hover:bg-[#F2ECE6] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Quotation
              </button>
              {admin && (
                <button
                  onClick={handleOpenAddVendor}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#323232] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7F3EE] hover:bg-[#1E1E1E] transition-all shadow-xs"
                >
                  <UsersRound className="w-4 h-4" />
                  Onboard Vendor
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Procurement KPI Summary Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E827A]">Total Vendors</span>
            <p className="text-2xl font-bold text-[#323232] mt-1">{kpis.totalVendorsCount}</p>
            <span className="text-[10px] text-emerald-700 font-medium">All KYC & GST verified</span>
          </div>

          <div className="rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E827A]">Project Contracts</span>
            <p className="text-2xl font-bold text-[#323232] mt-1">{kpis.totalContractsCount}</p>
            <span className="text-[10px] text-[#8E827A]">Across 4 active sites</span>
          </div>

          <div className="rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E827A]">Contracted Value</span>
            <p className="text-xl font-bold text-[#323232] mt-1">{formatINR(kpis.totalContractValue)}</p>
            <span className="text-[10px] text-[#8E827A]">Committed work orders</span>
          </div>

          <div className="rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E827A]">Active Negotiations</span>
            <p className="text-2xl font-bold text-amber-700 mt-1">{kpis.activeNegotiationsCount}</p>
            <span className="text-[10px] text-amber-600 font-medium">Quotes in price discovery</span>
          </div>

          <div className="rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] p-4 col-span-2 md:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E827A]">Builder Savings</span>
            <p className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              {formatINR(kpis.totalNegotiationSavings)}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Gained via counter-offers</span>
          </div>
        </div>

        {/* View Selection Tabs & Search / Filter Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E0DA] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('NEGOTIATIONS')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'NEGOTIATIONS'
                    ? 'bg-[#323232] text-white shadow-xs'
                    : 'bg-[#FBF9F7] text-[#595552] border border-[#E8E0DA] hover:bg-[#F2ECE6]'
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                Quotations & Price Negotiations ({allQuotations.length})
              </button>

              <button
                onClick={() => setActiveTab('VENDORS')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'VENDORS'
                    ? 'bg-[#323232] text-white shadow-xs'
                    : 'bg-[#FBF9F7] text-[#595552] border border-[#E8E0DA] hover:bg-[#F2ECE6]'
                }`}
              >
                <UsersRound className="w-3.5 h-3.5" />
                All Vendors & Contracts ({vendors.length})
              </button>

              <button
                onClick={() => setActiveTab('BY_PROJECT')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'BY_PROJECT'
                    ? 'bg-[#323232] text-white shadow-xs'
                    : 'bg-[#FBF9F7] text-[#595552] border border-[#E8E0DA] hover:bg-[#F2ECE6]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Site-Wise Vendor Map
              </button>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-[#8E827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor, item description, GSTIN or quote #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E0DA] bg-white text-xs text-[#323232] placeholder-[#8E827A] focus:outline-none focus:ring-2 focus:ring-[#323232]"
              />
            </div>

            {/* Project Filter */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#E8E0DA] bg-white text-xs text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="ALL">All Projects</option>
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#E8E0DA] bg-white text-xs text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Status Filter for Negotiations tab */}
            {activeTab === 'NEGOTIATIONS' && (
              <select
                value={selectedQuoteStatus}
                onChange={(e) => setSelectedQuoteStatus(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E8E0DA] bg-white text-xs text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
              >
                <option value="ALL">All Negotiation Statuses</option>
                <option value="UNDER_NEGOTIATION">Under Negotiation</option>
                <option value="COUNTER_OFFERED">Counter-Offered</option>
                <option value="ACCEPTED">Accepted / Contracted</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUBMITTED">Newly Submitted</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: QUOTATIONS & BUILDER NEGOTIATIONS VIEW */}
        {activeTab === 'NEGOTIATIONS' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-[#E8E0DA] bg-white shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E8E0DA] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-[#323232]">
                    Material & Service Price Negotiations ({filteredQuotations.length})
                  </h3>
                  <p className="text-xs text-[#8E827A] mt-0.5">
                    Compare initial vendor bids, submit counter-proposals, and lock finalized contract rates.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#595552]">
                  <thead className="bg-[#FBF9F7] text-[11px] uppercase tracking-wider text-[#8E827A] border-b border-[#E8E0DA]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Quotation / Project</th>
                      <th className="py-3.5 px-4 font-semibold">Vendor</th>
                      <th className="py-3.5 px-4 font-semibold">Item & Scope</th>
                      <th className="py-3.5 px-4 font-semibold">Quantity</th>
                      <th className="py-3.5 px-4 font-semibold">Quoted vs Target</th>
                      <th className="py-3.5 px-4 font-semibold">Counter / Agreed</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0DA]/70 font-normal">
                    {filteredQuotations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[#8E827A]">
                          No quotations match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredQuotations.map((quote) => {
                        const statusBadge = getStatusBadge(quote.status);
                        const rateDiff = (quote.currentCounterRate || quote.finalAgreedRate)
                          ? quote.initialQuotedRate - (quote.finalAgreedRate || quote.currentCounterRate || quote.initialQuotedRate)
                          : 0;
                        const savingsPercent = quote.initialQuotedRate > 0
                          ? Math.round((rateDiff / quote.initialQuotedRate) * 100)
                          : 0;

                        return (
                          <tr key={quote.id} className="hover:bg-[#FBF9F7] transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-semibold text-[#323232] block">
                                {quote.quotationNumber}
                              </span>
                              <span className="text-[11px] text-[#8E827A] flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {quote.projectName}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-medium text-[#323232] block">{quote.vendorName}</span>
                              <span className="text-[11px] text-[#8E827A]">{quote.category}</span>
                            </td>

                            <td className="py-3.5 px-4 max-w-[260px]">
                              <p className="line-clamp-2 text-[#323232] font-medium" title={quote.itemDescription}>
                                {quote.itemDescription}
                              </p>
                              <span className="text-[10px] text-[#8E827A]">GST: {quote.gstRate}%</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-[#323232]">
                                {quote.quantity.toLocaleString('en-IN')} {quote.unit}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div>
                                <span className="font-semibold text-[#323232]">
                                  ₹{quote.initialQuotedRate.toLocaleString('en-IN')}/{quote.unit}
                                </span>
                                {quote.builderTargetRate && (
                                  <span className="text-[11px] text-amber-700 block">
                                    Target: ₹{quote.builderTargetRate.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {quote.finalAgreedRate ? (
                                <div>
                                  <span className="font-bold text-emerald-700 block">
                                    ₹{quote.finalAgreedRate.toLocaleString('en-IN')}/{quote.unit}
                                  </span>
                                  {savingsPercent > 0 && (
                                    <span className="text-[10px] text-emerald-600 font-semibold">
                                      Saved {savingsPercent}% ({formatINR(rateDiff * quote.quantity)})
                                    </span>
                                  )}
                                </div>
                              ) : quote.currentCounterRate ? (
                                <div>
                                  <span className="font-bold text-blue-700 block">
                                    ₹{quote.currentCounterRate.toLocaleString('en-IN')}/{quote.unit}
                                  </span>
                                  {savingsPercent > 0 && (
                                    <span className="text-[10px] text-blue-600 font-semibold">
                                      -{savingsPercent}% vs Quote
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[#8E827A] italic text-[11px]">No counter yet</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg}`}
                              >
                                {statusBadge.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenNegotiation(quote)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#323232] text-[#F7F3EE] text-[11px] font-semibold hover:bg-[#1E1E1E] transition-all shadow-xs"
                                >
                                  <Handshake className="w-3.5 h-3.5" />
                                  {quote.status === 'ACCEPTED' ? 'View Terms' : 'Negotiate'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL VENDORS & CONTRACTS DIRECTORY */}
        {activeTab === 'VENDORS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.length === 0 ? (
              <div className="col-span-full py-16 text-center text-[#8E827A] bg-white rounded-3xl border border-[#E8E0DA]">
                No vendors found matching your search.
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="rounded-3xl border border-[#E8E0DA] bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#F2ECE6] text-[#595552] text-[10px] font-semibold">
                            {vendor.category}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-600 text-xs font-semibold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {vendor.rating}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#323232] mt-1.5">{vendor.name}</h4>
                        <p className="text-xs text-[#8E827A] font-mono mt-0.5">GST: {vendor.gstin}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {vendor.status}
                      </span>
                    </div>

                    {/* Contact Snippet */}
                    <div className="p-3 rounded-2xl bg-[#FBF9F7] space-y-1.5 text-xs text-[#595552]">
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-3.5 h-3.5 text-[#8E827A]" />
                        <span className="font-medium text-[#323232]">{vendor.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#8E827A]" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#8E827A]" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#8E827A]" />
                        <span>{vendor.city}</span>
                      </div>
                    </div>

                    {/* Contracted Projects Summary */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E827A] block mb-1.5">
                        Contracted Projects ({vendor.contracts.length})
                      </span>
                      {vendor.contracts.length === 0 ? (
                        <p className="text-xs text-[#8E827A] italic">No active contracts signed yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {vendor.contracts.map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-xl border border-[#E8E0DA] bg-white text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-semibold text-[#323232] block">{c.projectName}</span>
                                <span className="text-[10px] text-[#8E827A] line-clamp-1">{c.title}</span>
                              </div>
                              <span className="font-bold text-[#323232] text-xs">
                                {formatINR(c.contractValue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 mt-4 border-t border-[#E8E0DA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-[#8E827A] block">Total Contract Value</span>
                      <span className="font-bold text-sm text-[#323232]">
                        {formatINR(vendor.totalContractedValue)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenVendorDetail(vendor)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E0DA] bg-[#FBF9F7] text-[#323232] text-xs font-semibold hover:bg-[#F2ECE6] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Dossier
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SITE-WISE VENDOR MAP VIEW */}
        {activeTab === 'BY_PROJECT' && (
          <div className="space-y-6">
            {PROJECTS.map((project) => {
              const projectContracts = vendors.flatMap((v) =>
                v.contracts
                  .filter((c) => c.projectId === project.id)
                  .map((c) => ({ ...c, vendorName: v.name, vendorPhone: v.phone, vendorGstin: v.gstin }))
              );
              const projectQuotes = vendors.flatMap((v) =>
                v.quotations.filter((q) => q.projectId === project.id)
              );
              const totalSiteContracted = projectContracts.reduce((acc, c) => acc + c.contractValue, 0);

              return (
                <div key={project.id} className="rounded-3xl border border-[#E8E0DA] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E8E0DA]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#F2ECE6] flex items-center justify-center text-[#323232]">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-semibold text-[#8E827A]">{project.code}</span>
                        <h3 className="text-lg font-bold text-[#323232]">{project.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[10px] uppercase text-[#8E827A] block font-semibold">
                          Contracted Vendors
                        </span>
                        <span className="text-sm font-bold text-[#323232]">{projectContracts.length} On-Site</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#8E827A] block font-semibold">
                          Total Committed Value
                        </span>
                        <span className="text-sm font-bold text-[#323232]">
                          {formatINR(totalSiteContracted)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#8E827A] block font-semibold">
                          Pending Quotes
                        </span>
                        <span className="text-sm font-bold text-amber-700">
                          {projectQuotes.filter((q) => q.status !== 'ACCEPTED').length} Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contracted Vendors List for this Project */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E827A] mb-3">
                      Executed Project Contracts
                    </h4>
                    {projectContracts.length === 0 ? (
                      <p className="text-xs text-[#8E827A] italic py-2">
                        No active vendor contracts assigned to this project yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {projectContracts.map((contract) => (
                          <div
                            key={contract.id}
                            className="p-4 rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-sm text-[#323232] block">
                                  {contract.vendorName}
                                </span>
                                <span className="text-[10px] text-[#8E827A] font-mono">
                                  {contract.contractNumber} • {contract.category}
                                </span>
                              </div>
                              <span className="font-bold text-sm text-[#323232]">
                                {formatINR(contract.contractValue)}
                              </span>
                            </div>
                            <p className="text-[#595552] line-clamp-2">{contract.title}</p>
                            <div className="pt-2 border-t border-[#E8E0DA]/60 flex items-center justify-between text-[11px] text-[#8E827A]">
                              <span>Valid: {contract.startDate} to {contract.endDate}</span>
                              <span className="text-emerald-700 font-semibold">{contract.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. NEGOTIATION / COUNTER-OFFER MODAL */}
      {activeModal === 'NEGOTIATE' && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#323232]/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E0DA] max-h-[92vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E0DA]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2ECE6] text-[#595552]">
                    {selectedQuote.category}
                  </span>
                  <span className="font-mono text-xs text-[#8E827A]">{selectedQuote.quotationNumber}</span>
                </div>
                <h3 className="text-xl font-bold text-[#323232] mt-1">{selectedQuote.itemDescription}</h3>
                <p className="text-xs text-[#8E827A] mt-0.5">
                  Vendor: <strong className="text-[#323232]">{selectedQuote.vendorName}</strong> | Project: <strong className="text-[#323232]">{selectedQuote.projectName}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-full hover:bg-[#F2ECE6] text-[#8E827A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Discovery Matrix Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FBF9F7] border border-[#E8E0DA]">
                <span className="text-[#8E827A] text-[10px] uppercase font-semibold block">Total Quantity</span>
                <span className="text-sm font-bold text-[#323232] mt-1 block">
                  {selectedQuote.quantity.toLocaleString('en-IN')} {selectedQuote.unit}
                </span>
                <span className="text-[10px] text-[#8E827A]">Estimated Requirement</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FBF9F7] border border-[#E8E0DA]">
                <span className="text-[#8E827A] text-[10px] uppercase font-semibold block">Vendor Quote</span>
                <span className="text-sm font-bold text-[#323232] mt-1 block">
                  ₹{selectedQuote.initialQuotedRate.toLocaleString('en-IN')}/{selectedQuote.unit}
                </span>
                <span className="text-[10px] text-[#8E827A]">Total: {formatINR(selectedQuote.initialTotalAmount)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-amber-800 text-[10px] uppercase font-semibold block">Builder Target</span>
                <span className="text-sm font-bold text-amber-900 mt-1 block">
                  ₹{(selectedQuote.builderTargetRate || selectedQuote.initialQuotedRate * 0.9).toLocaleString('en-IN')}/{selectedQuote.unit}
                </span>
                <span className="text-[10px] text-amber-700">Budgeted ceiling</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-emerald-800 text-[10px] uppercase font-semibold block">Active Counter / Agreed</span>
                <span className="text-sm font-bold text-emerald-900 mt-1 block">
                  ₹{(selectedQuote.finalAgreedRate || selectedQuote.currentCounterRate || selectedQuote.initialQuotedRate).toLocaleString('en-IN')}/{selectedQuote.unit}
                </span>
                <span className="text-[10px] text-emerald-700">
                  {selectedQuote.finalAgreedRate ? 'Contract Locked' : 'Latest Proposed Rate'}
                </span>
              </div>
            </div>

            {/* Negotiation History Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E827A] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Negotiation Rounds & Audit Trail ({selectedQuote.negotiationHistory.length})
                </h4>
                <span className="text-[11px] text-[#8E827A]">Terms: {selectedQuote.paymentTermsOffered}</span>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] p-4 max-h-[220px] overflow-y-auto">
                {selectedQuote.negotiationHistory.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      item.role === 'BUILDER'
                        ? 'bg-amber-50/60 border-amber-200 ml-4'
                        : 'bg-white border-[#E8E0DA] mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className={item.role === 'BUILDER' ? 'text-amber-900' : 'text-[#323232]'}>
                        {idx + 1}. {item.author}
                      </span>
                      <span className="text-[10px] text-[#8E827A] font-mono">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#323232]">
                        Proposed: ₹{item.offeredRate.toLocaleString('en-IN')} {item.unit}
                      </span>
                      {item.creditDaysOffered && (
                        <span className="text-[10px] text-[#8E827A] bg-[#F2ECE6] px-1.5 py-0.5 rounded">
                          {item.creditDaysOffered} days credit
                        </span>
                      )}
                    </div>
                    <p className="text-[#595552] text-[11px] italic mt-0.5">{item.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Builder Action Panel */}
            {selectedQuote.status !== 'ACCEPTED' && (
              <div className="p-4 rounded-2xl border border-[#E8E0DA] bg-white space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#323232] flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-emerald-700" />
                  Submit Builder Counter-Offer or Lock Agreement
                </h4>

                {!isRejecting ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-[#595552] block mb-1">
                          Counter-Offer Unit Rate (₹ per {selectedQuote.unit}) *
                        </label>
                        <input
                          type="number"
                          value={counterRateInput}
                          onChange={(e) => setCounterRateInput(e.target.value)}
                          placeholder="e.g. 345"
                          className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-xs text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#595552] block mb-1">
                          Credit Days / Payment Terms
                        </label>
                        <input
                          type="text"
                          defaultValue="30 Days credit against verified challans"
                          className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-xs text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#595552] block mb-1">
                        Negotiation Justification / Counter Notes
                      </label>
                      <textarea
                        rows={2}
                        value={negotiationNotes}
                        onChange={(e) => setNegotiationNotes(e.target.value)}
                        placeholder="State reason: e.g. multi-site volume discount, absorption of site unloading costs, competitor rate comparison..."
                        className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-xs text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setIsRejecting(true)}
                        className="text-xs text-rose-700 font-semibold hover:underline"
                      >
                        Reject Quotation
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSubmitCounterOffer}
                          className="px-4 py-2 rounded-full border border-[#323232] text-xs font-semibold text-[#323232] hover:bg-[#F2ECE6] transition-colors"
                        >
                          Send Counter-Offer
                        </button>
                        {admin && (
                          <button
                            onClick={handleAcceptNegotiation}
                            className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept & Lock Contract
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-rose-800 block">
                      State reason for rejecting quotation:
                    </label>
                    <textarea
                      rows={2}
                      value={rejectReasonInput}
                      onChange={(e) => setRejectReasonInput(e.target.value)}
                      placeholder="e.g. Rate unacceptable, specifications do not match architectural schedule, or vendor disqualified."
                      className="w-full p-2.5 rounded-xl border border-rose-300 text-xs text-[#323232] focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsRejecting(false)}
                        className="px-3 py-1.5 rounded-full border border-[#E8E0DA] text-xs font-semibold text-[#595552]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRejectQuotationSubmit}
                        className="px-4 py-1.5 rounded-full bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VENDOR DOSSIER MODAL */}
      {activeModal === 'VIEW_VENDOR' && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#323232]/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E0DA] max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E0DA]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E827A]">
                  Vendor Profile & Audit Dossier
                </span>
                <h3 className="text-xl font-bold text-[#323232] mt-0.5">{selectedVendor.name}</h3>
                <span className="text-xs text-[#8E827A]">{selectedVendor.city} • Category: {selectedVendor.category}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-full hover:bg-[#F2ECE6] text-[#8E827A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legal & Banking Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FBF9F7] border border-[#E8E0DA] space-y-2">
                <span className="font-semibold text-[#323232] block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Tax & Verification
                </span>
                <div className="flex justify-between">
                  <span className="text-[#8E827A]">GSTIN</span>
                  <span className="font-mono font-semibold text-[#323232]">{selectedVendor.gstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E827A]">PAN</span>
                  <span className="font-mono font-semibold text-[#323232]">{selectedVendor.panNumber || 'On file'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E827A]">Vendor Status</span>
                  <span className="text-emerald-700 font-semibold">{selectedVendor.status}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBF9F7] border border-[#E8E0DA] space-y-2">
                <span className="font-semibold text-[#323232] block flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#8E827A]" />
                  Bank Account (For RTGS Settlement)
                </span>
                <div className="flex justify-between">
                  <span className="text-[#8E827A]">Bank</span>
                  <span className="font-semibold text-[#323232]">{selectedVendor.bankDetails?.bankName || 'HDFC Bank'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E827A]">Account #</span>
                  <span className="font-mono font-semibold text-[#323232]">{selectedVendor.bankDetails?.accountNumber || '••••••••4120'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E827A]">IFSC Code</span>
                  <span className="font-mono font-semibold text-[#323232]">{selectedVendor.bankDetails?.ifscCode || 'HDFC0000060'}</span>
                </div>
              </div>
            </div>

            {/* Contracts List */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E827A] mb-3">
                Contracted Projects ({selectedVendor.contracts.length})
              </h4>
              {selectedVendor.contracts.length === 0 ? (
                <p className="text-xs text-[#8E827A] italic">No contracts currently active.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedVendor.contracts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl border border-[#E8E0DA] bg-[#FBF9F7] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#323232]">{c.projectName} ({c.projectCode})</span>
                        <span className="text-[#323232] font-bold">{formatINR(c.contractValue)}</span>
                      </div>
                      <p className="text-[#595552]">{c.title}</p>
                      <div className="flex justify-between text-[11px] text-[#8E827A] pt-1 border-t border-[#E8E0DA]/60">
                        <span>Terms: {c.paymentTerms}</span>
                        <span className="text-emerald-700 font-semibold">{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quotations List */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E827A] mb-3">
                Quotations Submitted ({selectedVendor.quotations.length})
              </h4>
              {selectedVendor.quotations.length === 0 ? (
                <p className="text-xs text-[#8E827A] italic">No quotations submitted.</p>
              ) : (
                <div className="space-y-2">
                  {selectedVendor.quotations.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl border border-[#E8E0DA] bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#323232] block">{q.itemDescription}</span>
                        <span className="text-[11px] text-[#8E827A]">
                          {q.projectName} • {q.quantity} {q.unit} @ ₹{q.initialQuotedRate}/{q.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(q.status).bg}`}>
                          {getStatusBadge(q.status).label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. ONBOARD VENDOR MODAL */}
      {activeModal === 'ADD_VENDOR' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#323232]/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E0DA] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0DA]">
              <h3 className="font-bold text-base text-[#323232]">Onboard New Vendor</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#8E827A] hover:text-[#323232]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#595552] block mb-1">Company / Trade Name *</label>
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. JSW Steel Ltd or Jaquar Bath Fittings"
                  className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Primary Category</label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value as VendorCategory)}
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] uppercase focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. Amit Sharma"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sales@vendor.com"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Delhi NCR / Mumbai"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E0DA]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-full border border-[#E8E0DA] text-xs font-semibold text-[#595552]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewVendor}
                className="px-5 py-2 rounded-full bg-[#323232] text-white text-xs font-semibold hover:bg-[#1E1E1E]"
              >
                Save & Onboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NEW QUOTATION REQUEST MODAL */}
      {activeModal === 'NEW_QUOTE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#323232]/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E0DA] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E0DA]">
              <h3 className="font-bold text-base text-[#323232]">Record Vendor Quotation</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#8E827A] hover:text-[#323232]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Select Vendor *</label>
                  <select
                    value={newQuoteVendorId}
                    onChange={(e) => setNewQuoteVendorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Project Site *</label>
                  <select
                    value={newQuoteProjectId}
                    onChange={(e) => setNewQuoteProjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  >
                    {PROJECTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#595552] block mb-1">Item Description / Work Scope *</label>
                <input
                  type="text"
                  value={newQuoteDescription}
                  onChange={(e) => setNewQuoteDescription(e.target.value)}
                  placeholder="e.g. Fe500D TMT Rebars 20mm & 25mm (100 MT) for Tower C"
                  className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={newQuoteQuantity}
                    onChange={(e) => setNewQuoteQuantity(e.target.value)}
                    placeholder="1000"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newQuoteUnit}
                    onChange={(e) => setNewQuoteUnit(e.target.value)}
                    placeholder="Bags, MT, Cu.M"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Quoted Rate (₹) *</label>
                  <input
                    type="number"
                    value={newQuoteRate}
                    onChange={(e) => setNewQuoteRate(e.target.value)}
                    placeholder="Rate per unit"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">Builder Target Rate (₹)</label>
                  <input
                    type="number"
                    value={newQuoteTargetRate}
                    onChange={(e) => setNewQuoteTargetRate(e.target.value)}
                    placeholder="Desired negotiated rate"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#595552] block mb-1">GST %</label>
                  <select
                    value={newQuoteGst}
                    onChange={(e) => setNewQuoteGst(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#595552] block mb-1">Offered Credit Terms</label>
                <input
                  type="text"
                  value={newQuotePaymentTerms}
                  onChange={(e) => setNewQuotePaymentTerms(e.target.value)}
                  placeholder="e.g. 30 days credit from site delivery"
                  className="w-full p-2.5 rounded-xl border border-[#E8E0DA] text-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E0DA]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-full border border-[#E8E0DA] text-xs font-semibold text-[#595552]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewQuote}
                className="px-5 py-2 rounded-full bg-[#323232] text-white text-xs font-semibold hover:bg-[#1E1E1E]"
              >
                Record Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default VendorsPage;
