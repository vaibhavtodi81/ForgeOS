// Imports useState from react so this module can reuse that component, helper, or library.
import { useState } from 'react'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  TrendingUp,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  AlertTriangle,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Receipt,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ClipboardList,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  CheckCircle2,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Package,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Layers,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Users,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  Clock
// Continues the component or data expression so its related values and behavior stay grouped together.
} from 'lucide-react'

// Stores the value in ProductGallery so later lines can reuse this data or behavior for the current feature.
export const ProductGallery = () => {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [activeTab, setActiveTab] = useState<'admin' | 'pm' | 'wastage'>('admin')

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <section id="gallery" className="py-24 sm:py-32 bg-[#DDD0C8] text-[#323232] relative overflow-hidden border-t border-[#323232]/10">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#323232] text-[#DDD0C8] mb-4">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Interactive Product Demo
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#323232]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Designed for Both Site Engineers & Project Owners
          {/* Closes the <h2> element so later content is no longer part of this region. */}
          </h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-4 text-base sm:text-lg text-[#595552] font-light">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            See how ForgeOS transforms day-to-day operations for on-site supervisors and boardroom decision makers.
          {/* Closes the <p> element so later content is no longer part of this region. */}
          </p>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* Role Selector Tabs - Minimalist pill */}
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex justify-center mb-10">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="inline-flex p-1.5 rounded-full bg-[#E8DCD4] border border-[#323232]/15 shadow-inner">
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setActiveTab('admin')}
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                /* Sets the activeTab property so this element receives the data or behavior required by this screen. */
                /* Sets the activeTab property so this element receives the data or behavior required by this screen. */
                activeTab === 'admin'
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  ? 'bg-[#323232] text-[#DDD0C8] shadow-md'
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  : 'text-[#595552] hover:text-[#323232]'
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              }`}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Starts the <TrendingUp> element to organize this part of the interface. */}
              <TrendingUp className="w-3.5 h-3.5" />
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Builder Overview
            {/* Closes the <button> element so later content is no longer part of this region. */}
            </button>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setActiveTab('pm')}
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                /* Sets the activeTab property so this element receives the data or behavior required by this screen. */
                /* Sets the activeTab property so this element receives the data or behavior required by this screen. */
                activeTab === 'pm'
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  ? 'bg-[#323232] text-[#DDD0C8] shadow-md'
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  : 'text-[#595552] hover:text-[#323232]'
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              }`}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Starts the <ClipboardList> element to organize this part of the interface. */}
              <ClipboardList className="w-3.5 h-3.5" />
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Site PM Logger
            {/* Closes the <button> element so later content is no longer part of this region. */}
            </button>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button
              /* Connects the Click event to its handler so the interface can respond to interaction. */
              onClick={() => setActiveTab('wastage')}
              /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                /* Sets the activeTab property so this element receives the data or behavior required by this screen. */
                /* Sets the activeTab property so this element receives the data or behavior required by this screen. */
                activeTab === 'wastage'
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  ? 'bg-[#323232] text-[#DDD0C8] shadow-md'
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  /* Continues the component or data expression so its related values and behavior stay grouped together. */
                  : 'text-[#595552] hover:text-[#323232]'
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              /* Continues the component or data expression so its related values and behavior stay grouped together. */
              }`}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
              {/* Starts the <AlertTriangle> element to organize this part of the interface. */}
              <AlertTriangle className="w-3.5 h-3.5" />
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Wastage & Bills
            {/* Closes the <button> element so later content is no longer part of this region. */}
            </button>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* Tab 1: Builder/Admin View */}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {activeTab === 'admin' && (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <div className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-6 sm:p-10 shadow-sm">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex-1 w-full space-y-6">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex items-center justify-between pb-4 border-b border-[#323232]/10">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs text-[#595552] font-semibold uppercase tracking-wider">Multi-Project Portfolio</span>
                    {/* Starts the <h3> element to organize this part of the interface. */}
                    <h3 className="text-xl font-bold text-[#323232] mt-1">Skyline Heights & Grand Palms</h3>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#323232] text-[#DDD0C8]">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    Live Data
                  {/* Closes the <span> element so later content is no longer part of this region. */}
                  </span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* 4 Stat Cards */}
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs text-[#595552] font-light">Total Portfolio</span>
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="text-lg font-bold text-[#323232] mt-1">₹38.0 Cr</p>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-[11px] text-[#595552]">4 Active Sites</span>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs text-[#595552] font-light">Committed Spend</span>
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="text-lg font-bold text-[#323232] mt-1">₹11.2 Cr</p>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-[11px] text-[#595552]">29.4% budget</span>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs text-[#595552] font-light">Paid Out</span>
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="text-lg font-bold text-[#323232] mt-1">₹8.4 Cr</p>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-[11px] text-[#595552]">Zero disputes</span>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10">
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs text-[#595552] font-light">Pending Bills</span>
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="text-lg font-bold text-[#323232] mt-1">5 Invoices</p>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-[11px] text-[#595552]">₹31.5 L waiting</span>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* Active Project breakdown */}
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="p-5 rounded-2xl bg-[#DDD0C8]/40 border border-[#323232]/10 space-y-4">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex justify-between items-center text-sm">
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="font-bold text-[#323232]">Tower A (Sector 12, Sonipat)</span>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs font-bold uppercase tracking-wider text-[#323232]">42.5% Complete</span>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Progress bar in dark grey */}
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="w-full bg-[#DDD0C8] rounded-full h-2.5 overflow-hidden border border-[#323232]/10">
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="bg-[#323232] h-full rounded-full transition-all" style={{ width: '42.5%' }} />
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex justify-between text-xs text-[#595552] font-light">
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span>PM: Anil Kumar</span>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span>Last Log: Today, 08:30 AM</span>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span>Stage: 5th Floor Slab</span>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>

              {/* Sidebar */}
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-[#323232]/10 pt-6 lg:pt-0 lg:pl-8">
                {/* Starts the <h4> element to organize this part of the interface. */}
                <h4 className="font-bold text-[#323232] text-sm uppercase tracking-wider flex items-center gap-2">
                  {/* Starts the <Layers> element to organize this part of the interface. */}
                  <Layers className="w-4 h-4" />
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  What Builders Gain:
                {/* Closes the <h4> element so later content is no longer part of this region. */}
                </h4>
                {/* Starts the <ul> element to organize this part of the interface. */}
                <ul className="space-y-3 text-sm text-[#595552] font-light">
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>100% Portfolio Visibility</strong> without endless phone calls to site engineers.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>Cash Flow Control</strong> by approving contractor bills directly from mobile.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>Multi-Land Tracking</strong> connecting land acquisition to project phases.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                {/* Closes the <ul> element so later content is no longer part of this region. */}
                </ul>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        )}

        {/* Tab 2: PM / Site View */}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {activeTab === 'pm' && (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <div className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-6 sm:p-10 shadow-sm">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex-1 w-full space-y-6">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex items-center justify-between pb-4 border-b border-[#323232]/10">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs text-[#595552] font-semibold uppercase tracking-wider">Mobile-Friendly Site Logger</span>
                    {/* Starts the <h3> element to organize this part of the interface. */}
                    <h3 className="text-xl font-bold text-[#323232] mt-1">Daily Work Log — 06 Nov 2026</h3>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#323232] text-[#DDD0C8]">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    Draft Saved
                  {/* Closes the <span> element so later content is no longer part of this region. */}
                  </span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10 space-y-3">
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="flex items-center gap-2 text-sm font-bold text-[#323232]">
                      {/* Starts the <Users> element to organize this part of the interface. */}
                      <Users className="w-4 h-4" />
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      Labour Headcount
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="space-y-2 text-xs">
                      {/* Starts the <div> element to organize this part of the interface. */}
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span>Masons (R. Singh & Co)</span>
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span className="font-bold text-[#323232]">12 workers (8h)</span>
                      {/* Closes the <div> element so later content is no longer part of this region. */}
                      </div>
                      {/* Starts the <div> element to organize this part of the interface. */}
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span>Helpers & Unskilled</span>
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span className="font-bold text-[#323232]">20 workers (8h)</span>
                      {/* Closes the <div> element so later content is no longer part of this region. */}
                      </div>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>

                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10 space-y-3">
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="flex items-center gap-2 text-sm font-bold text-[#323232]">
                      {/* Starts the <Clock> element to organize this part of the interface. */}
                      <Clock className="w-4 h-4" />
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      Machinery & Fuel
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="space-y-2 text-xs">
                      {/* Starts the <div> element to organize this part of the interface. */}
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span>Tower Crane (Operator: Ramesh)</span>
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span className="font-bold text-[#323232]">7.5 hrs (35L)</span>
                      {/* Closes the <div> element so later content is no longer part of this region. */}
                      </div>
                      {/* Starts the <div> element to organize this part of the interface. */}
                      <div className="flex justify-between text-[#595552] bg-[#E8DCD4] p-2 rounded-lg">
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span>Concrete Mixer</span>
                        {/* Starts the <span> element to organize this part of the interface. */}
                        <span className="font-bold text-[#323232]">6.0 hrs (22L)</span>
                      {/* Closes the <div> element so later content is no longer part of this region. */}
                      </div>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="p-4 rounded-2xl bg-[#DDD0C8]/40 border border-[#323232]/10 flex items-center justify-between text-sm">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center gap-3">
                    {/* Starts the <Package> element to organize this part of the interface. */}
                    <Package className="w-5 h-5 text-[#323232]" />
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="font-bold text-[#323232]">Stock IN Received: 800 Bags Cement</p>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="text-xs text-[#595552]">Vendor: Shree Cement Traders • Challan #CH-4471</p>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#323232] text-[#DDD0C8]">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    Balance: 1,250 Bags
                  {/* Closes the <span> element so later content is no longer part of this region. */}
                  </span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>

              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-[#323232]/10 pt-6 lg:pt-0 lg:pl-8">
                {/* Starts the <h4> element to organize this part of the interface. */}
                <h4 className="font-bold text-[#323232] text-sm uppercase tracking-wider flex items-center gap-2">
                  {/* Starts the <ClipboardList> element to organize this part of the interface. */}
                  <ClipboardList className="w-4 h-4" />
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  What Site PMs Love:
                {/* Closes the <h4> element so later content is no longer part of this region. */}
                </h4>
                {/* Starts the <ul> element to organize this part of the interface. */}
                <ul className="space-y-3 text-sm text-[#595552] font-light">
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>Under 3-Minute Site Logs</strong> right from their phone at the casting site.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>Prevents Negative Stock</strong> with automated inventory locks.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>Zero Paper Registers</strong> or lost WhatsApp group photos.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                {/* Closes the <ul> element so later content is no longer part of this region. */}
                </ul>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        )}

        {/* Tab 3: Wastage & Billing */}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {activeTab === 'wastage' && (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <div className="bg-[#E8DCD4] border border-[#323232]/10 rounded-3xl p-6 sm:p-10 shadow-sm">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="flex-1 w-full space-y-6">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="flex items-center justify-between pb-4 border-b border-[#323232]/10">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs text-[#595552] font-semibold uppercase tracking-wider">Progress-Adjusted Formula</span>
                    {/* Starts the <h3> element to organize this part of the interface. */}
                    <h3 className="text-xl font-bold text-[#323232] mt-1">Live Material Wastage & Bill Auditing</h3>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#323232] text-[#DDD0C8]">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    1 Alert Active
                  {/* Closes the <span> element so later content is no longer part of this region. */}
                  </span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="p-4 rounded-2xl bg-[#DDD0C8]/60 border border-[#323232]/10 space-y-3">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex justify-between items-center">
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div>
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="font-bold text-[#323232]">OPC 53 Cement</span>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="text-xs text-[#595552]">Planned: 12,000 Bags @ ₹395/bag • Project Progress: 42.5%</p>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#323232] text-[#DDD0C8]">
                      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                      +25.5% Overrun
                    {/* Closes the <span> element so later content is no longer part of this region. */}
                    </span>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>

                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-center pt-2">
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="bg-[#E8DCD4] p-2 rounded-lg">
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="text-[#595552] block">Expected to Date</span>
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="font-bold text-[#323232]">5,100 Bags</span>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="bg-[#E8DCD4] p-2 rounded-lg">
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="text-[#595552] block">Actual Consumed</span>
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="font-bold text-[#323232]">6,400 Bags</span>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="bg-[#E8DCD4] p-2 rounded-lg">
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="text-[#595552] block">Estimated Loss</span>
                      {/* Starts the <span> element to organize this part of the interface. */}
                      <span className="font-bold text-[#323232]">₹5,13,500</span>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>

                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="p-4 rounded-2xl bg-[#DDD0C8]/40 border border-[#323232]/10 flex items-center justify-between text-sm">
                  {/* Starts the <div> element to organize this part of the interface. */}
                  <div className="flex items-center gap-3">
                    {/* Starts the <Receipt> element to organize this part of the interface. */}
                    <Receipt className="w-5 h-5 text-[#323232]" />
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="font-bold text-[#323232]">Bill #INV-2026-0451 — Shree Cement Traders</p>
                      {/* Starts the <p> element to organize this part of the interface. */}
                      <p className="text-xs text-[#595552]">Base: ₹3,18,400 + 18% GST (₹57,312) = Total ₹3,75,712</p>
                    {/* Closes the <div> element so later content is no longer part of this region. */}
                    </div>
                  {/* Closes the <div> element so later content is no longer part of this region. */}
                  </div>
                  {/* Starts the <span> element to organize this part of the interface. */}
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#323232] text-[#DDD0C8]">
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    Awaiting Approval
                  {/* Closes the <span> element so later content is no longer part of this region. */}
                  </span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>

              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="w-full lg:w-80 space-y-4 border-t lg:border-t-0 lg:border-l border-[#323232]/10 pt-6 lg:pt-0 lg:pl-8">
                {/* Starts the <h4> element to organize this part of the interface. */}
                <h4 className="font-bold text-[#323232] text-sm uppercase tracking-wider flex items-center gap-2">
                  {/* Starts the <AlertTriangle> element to organize this part of the interface. */}
                  <AlertTriangle className="w-4 h-4" />
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Why This Saves Money:
                {/* Closes the <h4> element so later content is no longer part of this region. */}
                </h4>
                {/* Starts the <ul> element to organize this part of the interface. */}
                <ul className="space-y-3 text-sm text-[#595552] font-light">
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>Real-time Detection</strong>: Catch material theft mid-project, not after completion.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>GST & Challan Linked</strong>: Verify delivery proofs before releasing payments.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                  {/* Starts the <li> element to organize this part of the interface. */}
                  <li className="flex items-start gap-2.5">
                    {/* Starts the <CheckCircle2> element to organize this part of the interface. */}
                    <CheckCircle2 className="w-4 h-4 text-[#323232] mt-0.5 shrink-0" />
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span><strong>Overdue Prevention</strong>: Track due dates to keep supplier terms intact.</span>
                  {/* Closes the <li> element so later content is no longer part of this region. */}
                  </li>
                {/* Closes the <ul> element so later content is no longer part of this region. */}
                </ul>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        // Continues the component or data expression so its related values and behavior stay grouped together.
        )}
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <section> element so later content is no longer part of this region. */}
    </section>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable ProductGallery interface component.
