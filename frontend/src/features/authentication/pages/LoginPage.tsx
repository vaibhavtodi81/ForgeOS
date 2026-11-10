import { ArrowLeft, Building2, HardHat, Layers3 } from 'lucide-react'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <main className="forgeos-auth-shell min-h-screen px-4 py-6 text-[#F5F2ED] sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="ForgeOS home">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#323232] text-[#F7F3EE]">
              <Building2 size={23} />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">ForgeOS</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8E827A]">
                Construction management
              </p>
            </div>
          </a>

          <a
            href="/"
            className="flex items-center gap-2 rounded-full border border-[#C8BCB4] px-4 py-2.5 text-sm font-medium text-[#595552] transition hover:bg-[#F7F3EE]"
          >
            <ArrowLeft size={16} />
            Back to website
          </a>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#C8BCB4] bg-[#E8DCD4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#595552]">
              <span className="h-2 w-2 rounded-full bg-[#595552]" />
              Your project workspace
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.12] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Build better.
              <br />
              <span className="text-[#8E827A]">Manage smarter.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#595552] sm:text-lg">
              One connected workspace to manage projects, coordinate teams and
              keep every construction milestone moving forward.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#C8BCB4] bg-[#E8DCD4] p-5">
                <Layers3 size={22} className="mb-5 text-[#595552]" />
                <p className="text-sm font-semibold">Project control</p>
                <p className="mt-1 text-xs leading-5 text-[#7A7470]">
                  Everything organized in one place.
                </p>
              </div>

              <div className="rounded-2xl border border-[#C8BCB4] bg-[#E8DCD4] p-5">
                <HardHat size={22} className="mb-5 text-[#595552]" />
                <p className="text-sm font-semibold">Site operations</p>
                <p className="mt-1 text-xs leading-5 text-[#7A7470]">
                  Keep your teams aligned every day.
                </p>
              </div>
            </div>

            <p className="mt-10 text-xs tracking-wide text-[#8E827A]">
              DESIGNED FOR THE PEOPLE WHO BUILD THE FUTURE.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[28px] border border-[#C8BCB4] bg-[#F7F3EE] p-6 shadow-[0_24px_70px_rgba(50,50,50,0.09)] sm:p-9">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E827A]">
                  Welcome back
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#7A7470]">
                  Enter your credentials to access your workspace.
                </p>
              </div>

              <LoginForm />

              <div className="my-7 h-px bg-[#C8BCB4]/70" />

              <p className="text-center text-xs leading-6 text-[#8E827A]">
                Need access? Contact your workspace administrator.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-[#8E827A]">
              © {new Date().getFullYear()} ForgeOS. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
