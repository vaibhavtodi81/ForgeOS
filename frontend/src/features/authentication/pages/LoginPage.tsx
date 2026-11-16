// Imports ArrowLeft, Building2, HardHat, Layers3 from lucide-react so this module can reuse that component, helper, or library.
import { ArrowLeft, Building2, HardHat, Layers3 } from 'lucide-react'
// Imports LoginForm from ../components/LoginForm so this module can reuse that component, helper, or library.
import { LoginForm } from '../components/LoginForm'

// Defines LoginPage so this module can perform its named task when needed.
export function LoginPage() {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <main className="forgeos-auth-shell min-h-screen px-4 py-6 text-[#F5F2ED] sm:px-8 lg:px-12 lg:py-10">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        {/* Starts the <header> element to organize this part of the interface. */}
        <header className="flex items-center justify-between">
          {/* Starts the <a> element to provide navigation to another location. */}
          <a href="/" className="flex items-center gap-3" aria-label="ForgeOS home">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#323232] text-[#F7F3EE]">
              {/* Starts the <Building2> element to organize this part of the interface. */}
              <Building2 size={23} />
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="text-xl font-bold tracking-tight">ForgeOS</p>
              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8E827A]">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                Construction management
              {/* Closes the <p> element so later content is no longer part of this region. */}
              </p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
          {/* Closes the <a> element so later content is no longer part of this region. */}
          </a>

          {/* Starts the <a> element to provide navigation to another location. */}
          <a
            /* Sets the destination so activating this link or route control opens the intended screen. */
            href="/"
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="flex items-center gap-2 rounded-full border border-[#C8BCB4] px-4 py-2.5 text-sm font-medium text-[#595552] transition hover:bg-[#F7F3EE]"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Starts the <ArrowLeft> element to organize this part of the interface. */}
            <ArrowLeft size={16} />
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            Back to website
          {/* Closes the <a> element so later content is no longer part of this region. */}
          </a>
        {/* Closes the <header> element so later content is no longer part of this region. */}
        </header>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="mx-auto w-full max-w-xl">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#C8BCB4] bg-[#E8DCD4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#595552]">
              {/* Starts the <span> element to organize this part of the interface. */}
              <span className="h-2 w-2 rounded-full bg-[#595552]" />
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Your project workspace
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>

            {/* Starts the <h1> element to organize this part of the interface. */}
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.12] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              Build better.
              {/* Starts the <br> element to organize this part of the interface. */}
              <br />
              {/* Starts the <span> element to organize this part of the interface. */}
              <span className="text-[#8E827A]">Manage smarter.</span>
            {/* Closes the <h1> element so later content is no longer part of this region. */}
            </h1>

            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-6 max-w-lg text-base leading-8 text-[#595552] sm:text-lg">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              One connected workspace to manage projects, coordinate teams and
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              keep every construction milestone moving forward.
            {/* Closes the <p> element so later content is no longer part of this region. */}
            </p>

            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="rounded-2xl border border-[#C8BCB4] bg-[#E8DCD4] p-5">
                {/* Starts the <Layers3> element to organize this part of the interface. */}
                <Layers3 size={22} className="mb-5 text-[#595552]" />
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-sm font-semibold">Project control</p>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="mt-1 text-xs leading-5 text-[#7A7470]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Everything organized in one place.
                {/* Closes the <p> element so later content is no longer part of this region. */}
                </p>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>

              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="rounded-2xl border border-[#C8BCB4] bg-[#E8DCD4] p-5">
                {/* Starts the <HardHat> element to organize this part of the interface. */}
                <HardHat size={22} className="mb-5 text-[#595552]" />
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-sm font-semibold">Site operations</p>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="mt-1 text-xs leading-5 text-[#7A7470]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Keep your teams aligned every day.
                {/* Closes the <p> element so later content is no longer part of this region. */}
                </p>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>

            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-10 text-xs tracking-wide text-[#8E827A]">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              DESIGNED FOR THE PEOPLE WHO BUILD THE FUTURE.
            {/* Closes the <p> element so later content is no longer part of this region. */}
            </p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>

          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="mx-auto w-full max-w-md">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="rounded-[28px] border border-[#C8BCB4] bg-[#F7F3EE] p-6 shadow-[0_24px_70px_rgba(50,50,50,0.09)] sm:p-9">
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="mb-8">
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E827A]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Welcome back
                {/* Closes the <p> element so later content is no longer part of this region. */}
                </p>
                {/* Starts the <h2> element to organize this part of the interface. */}
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Sign in to your account
                {/* Closes the <h2> element so later content is no longer part of this region. */}
                </h2>
                {/* Starts the <p> element to organize this part of the interface. */}
                <p className="mt-2 text-sm leading-6 text-[#7A7470]">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  Enter your credentials to access your workspace.
                {/* Closes the <p> element so later content is no longer part of this region. */}
                </p>
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>

              {/* Starts the <LoginForm> element to organize this part of the interface. */}
              <LoginForm />

              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="my-7 h-px bg-[#C8BCB4]/70" />

              {/* Starts the <p> element to organize this part of the interface. */}
              <p className="text-center text-xs leading-6 text-[#8E827A]">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                Need access? Contact your workspace administrator.
              {/* Closes the <p> element so later content is no longer part of this region. */}
              </p>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>

            {/* Starts the <p> element to organize this part of the interface. */}
            <p className="mt-6 text-center text-xs text-[#8E827A]">
              {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
              © {new Date().getFullYear()} ForgeOS. All rights reserved.
            {/* Closes the <p> element so later content is no longer part of this region. */}
            </p>
          {/* Closes the <div> element so later content is no longer part of this region. */}
          </div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <main> element so later content is no longer part of this region. */}
    </main>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the authentication screen and coordinates its page-level interactions.
