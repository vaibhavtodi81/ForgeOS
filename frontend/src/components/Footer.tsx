// Imports Building2, Mail, Phone, MapPin, ArrowRight from lucide-react so this module can reuse that component, helper, or library.
import { Building2, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

// Stores the value in Footer so later lines can reuse this data or behavior for the current feature.
export const Footer = () => {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <footer className="bg-[#323232] text-[#DDD0C8] text-sm">
      {/* Top CTA banner in Beige */}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="bg-[#E8DCD4] text-[#323232] py-16 border-t border-[#323232]/10">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <h3> element to organize this part of the interface. */}
            <h3 className="text-2xl sm:text-4xl font-medium tracking-tight">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Ready to take full control of your construction sites?
            {/* Closes the <h3> element so later content is no longer part of this region. */}
            </h3>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-[#595552] mt-2 font-light text-base">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Start your 14-day free trial. Setup takes less than 15 minutes.
            {/* Closes the <p> element so later content is no longer part of this region. */}
            </p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button className="px-8 py-3.5 bg-[#323232] text-[#DDD0C8] font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-[#1E1E1E] transition-all shadow-md flex items-center gap-2 group whitespace-nowrap">
            {/* Starts the <span> element to organize this part of the interface. */}
            <span>Get Started with ForgeOS</span>
            {/* Starts the <ArrowRight> element to organize this part of the interface. */}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand col */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="space-y-4 md:col-span-1">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2.5">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="w-8 h-8 rounded-full bg-[#DDD0C8] text-[#323232] flex items-center justify-center font-bold">
                {/* Starts the <Building2> element to organize this part of the interface. */}
                <Building2 className="w-4 h-4" />
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <span> element to organize this part of the interface. */}
              <span className="text-lg font-bold tracking-[0.2em] uppercase text-[#DDD0C8]">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                FORGE<span className="text-[#DDD0C8]/60 font-light">OS</span>
              {/* Closes the <span> element so later content is no longer part of this region. */}
              </span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="text-xs text-[#DDD0C8]/70 leading-relaxed font-light">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              The centralized project & financial operating system for Indian builders and real estate developers.
            {/* Closes the <p> element so later content is no longer part of this region. */}
            </p>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="pt-2 text-xs text-[#DDD0C8]/50 font-mono">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              GST-Compliant • INR Standard • Multi-Site
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Links 1: Platform */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <h4> element to organize this part of the interface. */}
            <h4 className="text-xs font-bold text-[#DDD0C8] uppercase tracking-widest mb-4">Platform</h4>
            {/* Starts the <ul> element to organize this part of the interface. */}
            <ul className="space-y-2.5 text-xs text-[#DDD0C8]/70 font-light">
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#features" className="hover:text-white transition-colors">Multi-Project Dashboard</a></li>
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#features" className="hover:text-white transition-colors">Daily Site Logs</a></li>
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#features" className="hover:text-white transition-colors">Stock & Material Ledger</a></li>
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#features" className="hover:text-white transition-colors">Progress Wastage Radar</a></li>
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#features" className="hover:text-white transition-colors">Billing & Payments</a></li>
            {/* Closes the <ul> element so later content is no longer part of this region. */}
            </ul>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Links 2: Solutions */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div>
            {/* Starts the <h4> element to organize this part of the interface. */}
            <h4 className="text-xs font-bold text-[#DDD0C8] uppercase tracking-widest mb-4">Solutions</h4>
            {/* Starts the <ul> element to organize this part of the interface. */}
            <ul className="space-y-2.5 text-xs text-[#DDD0C8]/70 font-light">
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#how-it-works" className="hover:text-white transition-colors">For Managing Directors</a></li>
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#how-it-works" className="hover:text-white transition-colors">For Project Managers</a></li>
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#how-it-works" className="hover:text-white transition-colors">For Land Portfolio Owners</a></li>
              {/* Starts the <li> element to organize this part of the interface. */}
              <li><a href="#gallery" className="hover:text-white transition-colors">Interactive Demo</a></li>
            {/* Closes the <ul> element so later content is no longer part of this region. */}
            </ul>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Links 3: Contact */}
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="space-y-3">
            {/* Starts the <h4> element to organize this part of the interface. */}
            <h4 className="text-xs font-bold text-[#DDD0C8] uppercase tracking-widest mb-4">Contact</h4>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2.5 text-xs text-[#DDD0C8]/70 font-light">
              {/* Starts the <Mail> element to organize this part of the interface. */}
              <Mail className="w-4 h-4 text-[#DDD0C8] shrink-0" />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>contact@forgeos.build</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-center gap-2.5 text-xs text-[#DDD0C8]/70 font-light">
              {/* Starts the <Phone> element to organize this part of the interface. */}
              <Phone className="w-4 h-4 text-[#DDD0C8] shrink-0" />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>+91 98765 43210</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex items-start gap-2.5 text-xs text-[#DDD0C8]/70 font-light">
              {/* Starts the <MapPin> element to organize this part of the interface. */}
              <MapPin className="w-4 h-4 text-[#DDD0C8] shrink-0 mt-0.5" />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span>Greater Noida / Pune, India</span>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mt-12 pt-8 border-t border-[#DDD0C8]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#DDD0C8]/50 font-light">
          {/* Starts the <p> element to organize this part of the interface. */}
          <p>© {new Date().getFullYear()} ForgeOS Technologies. All rights reserved.</p>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex gap-6">
            {/* Starts the <a> element to provide navigation to another location. */}
            <a href="#" className="hover:text-[#DDD0C8]">Privacy Policy</a>
            {/* Starts the <a> element to provide navigation to another location. */}
            <a href="#" className="hover:text-[#DDD0C8]">Terms of Service</a>
            {/* Starts the <a> element to provide navigation to another location. */}
            <a href="#" className="hover:text-[#DDD0C8]">Security Standards</a>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <footer> element so later content is no longer part of this region. */}
    </footer>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable Footer interface component.
