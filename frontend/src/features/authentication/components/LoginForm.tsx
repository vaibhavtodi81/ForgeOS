// Imports useState, type FormEvent from react so this module can reuse that component, helper, or library.
import { useState, type FormEvent } from 'react'
// Imports ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck from lucide-react so this module can reuse that component, helper, or library.
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Imports useAuth from ../auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../auth/useAuth'

// Defines errorMessage so this module can perform its named task when needed.
function errorMessage(error: unknown): string {
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (error instanceof ApiError) {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (error.code === 'INVALID_CREDENTIALS' || error.status === 401) return 'Invalid email or password.'
    // Returns the result so the caller or React receives the value or interface this function provides.
    return error.message
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Returns the result so the caller or React receives the value or interface this function provides.
  return error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines LoginForm so this module can perform its named task when needed.
export function LoginForm() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { login } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [email, setEmail] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [password, setPassword] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [showPassword, setShowPassword] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [rememberMe, setRememberMe] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [message, setMessage] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Stores the value in handleSubmit so later lines can reuse this data or behavior for the current feature.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!email.trim() || !password) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMessage('Please enter your email and password.')
      // Returns the result so the caller or React receives the value or interface this function provides.
      return
    // Closes the current block or object so the grouped statements or settings end here.
    }

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setIsSubmitting(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setMessage('')
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Stores the value in user so later lines can reuse this data or behavior for the current feature.
      const user = await login(email.trim(), password, rememberMe)
      // Stores the value in destination so later lines can reuse this data or behavior for the current feature.
      const destination = user.role === 'ADMIN' ? '/app/admin/dashboard' : '/app/pm/dashboard'
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      window.history.replaceState({}, '', destination)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      window.dispatchEvent(new PopStateEvent('popstate'))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (error) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setMessage(errorMessage(error))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setIsSubmitting(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="space-y-2">
        {/* Starts the <label> element to name a form control for users and assistive technology. */}
        <label htmlFor="email" className="text-sm font-semibold text-[#323232]">Email address</label>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center gap-3 rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 transition focus-within:border-[#323232] focus-within:ring-2 focus-within:ring-[#323232]/10">
          {/* Starts the <Mail> element to organize this part of the interface. */}
          <Mail size={19} className="shrink-0 text-[#8E827A]" />
          {/* Starts the <input> element to collect or display a value. */}
          <input
            /* Gives the element a stable identifier for linking, lookup, or styling. */
            id="email"
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type="email"
            /* Supplies the value shown by this form control so the user sees the current data. */
            value={email}
            /* Connects the Change event to its handler so the interface can respond to interaction. */
            onChange={(event) => { setEmail(event.target.value); setMessage('') }}
            /* Sets the placeholder property so this element receives the data or behavior required by this screen. */
            /* Sets the placeholder property so this element receives the data or behavior required by this screen. */
            placeholder="you@company.com"
            /* Sets the autoComplete property so this element receives the data or behavior required by this screen. */
            /* Sets the autoComplete property so this element receives the data or behavior required by this screen. */
            autoComplete="email"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            required
            /* Controls whether the element can be used, preventing actions that are not currently available. */
            disabled={isSubmitting}
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="w-full bg-transparent py-4 text-sm text-[#323232] outline-none placeholder:text-[#A59A92]"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          />
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="space-y-2">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center justify-between">
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label htmlFor="password" className="text-sm font-semibold text-[#323232]">Password</label>
          {/* Starts the <span> element to organize this part of the interface. */}
          <span className="text-xs text-[#8E827A]">Contact your administrator for account help.</span>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="flex items-center gap-3 rounded-xl border border-[#C8BCB4] bg-[#F7F3EE] px-4 transition focus-within:border-[#323232] focus-within:ring-2 focus-within:ring-[#323232]/10">
          {/* Starts the <LockKeyhole> element to organize this part of the interface. */}
          <LockKeyhole size={19} className="shrink-0 text-[#8E827A]" />
          {/* Starts the <input> element to collect or display a value. */}
          <input
            /* Gives the element a stable identifier for linking, lookup, or styling. */
            id="password"
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type={showPassword ? 'text' : 'password'}
            /* Supplies the value shown by this form control so the user sees the current data. */
            value={password}
            /* Connects the Change event to its handler so the interface can respond to interaction. */
            onChange={(event) => { setPassword(event.target.value); setMessage('') }}
            /* Sets the placeholder property so this element receives the data or behavior required by this screen. */
            /* Sets the placeholder property so this element receives the data or behavior required by this screen. */
            placeholder="Enter your password"
            /* Sets the autoComplete property so this element receives the data or behavior required by this screen. */
            /* Sets the autoComplete property so this element receives the data or behavior required by this screen. */
            autoComplete="current-password"
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            required
            /* Controls whether the element can be used, preventing actions that are not currently available. */
            disabled={isSubmitting}
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="w-full bg-transparent py-4 text-sm text-[#323232] outline-none placeholder:text-[#A59A92]"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          />
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button
            /* Chooses the element’s browser behavior, such as a button action or input format. */
            type="button"
            /* Connects the Click event to its handler so the interface can respond to interaction. */
            onClick={() => setShowPassword((visible) => !visible)}
            /* Provides aria-label accessibility information so assistive technology can describe the element. */
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="text-[#8E827A] hover:text-[#323232]"
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          >
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          {/* Closes the <button> element so later content is no longer part of this region. */}
          </button>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Starts the <label> element to name a form control for users and assistive technology. */}
      <label className="flex cursor-pointer items-center gap-3 text-sm text-[#595552]">
        {/* Starts the <input> element to collect or display a value. */}
        <input
          /* Chooses the element’s browser behavior, such as a button action or input format. */
          type="checkbox"
          /* Sets the checked property so this element receives the data or behavior required by this screen. */
          /* Sets the checked property so this element receives the data or behavior required by this screen. */
          checked={rememberMe}
          /* Connects the Change event to its handler so the interface can respond to interaction. */
          onChange={(event) => setRememberMe(event.target.checked)}
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="h-4 w-4 accent-[#323232]"
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        />
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        Remember me on this device
      {/* Closes the <label> element so later content is no longer part of this region. */}
      </label>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {message && (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {message}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      // Continues the component or data expression so its related values and behavior stay grouped together.
      )}

      {/* Starts the <button> element to provide an action the user can activate. */}
      <button
        /* Chooses the element’s browser behavior, such as a button action or input format. */
        type="submit"
        /* Controls whether the element can be used, preventing actions that are not currently available. */
        disabled={isSubmitting}
        /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#323232] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#323232]/10 transition-all hover:-translate-y-0.5 hover:bg-[#1E1E1E] hover:shadow-xl active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      >
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {isSubmitting ? 'Signing in…' : 'Sign in'}
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
      {/* Closes the <button> element so later content is no longer part of this region. */}
      </button>

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#8E827A]">
        {/* Starts the <ShieldCheck> element to organize this part of the interface. */}
        <ShieldCheck size={15} />
        {/* Starts the <span> element to organize this part of the interface. */}
        <span>Secure access to your construction workspace</span>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <form> element so later content is no longer part of this region. */}
    </form>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable LoginForm interface component.
