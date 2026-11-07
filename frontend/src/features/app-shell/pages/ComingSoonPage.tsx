import { Construction } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { Breadcrumbs } from '../components/Breadcrumbs'

interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return <AppShell currentPath={window.location.pathname}><div className="mx-auto max-w-6xl p-6 lg:p-10"><Breadcrumbs current={title} /><div className="flex min-h-[55vh] items-center justify-center rounded-2xl border border-dashed border-[#C8BCB4] bg-white/60 p-8 text-center"><div><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E9E1] text-[#9A5E3A]"><Construction className="h-7 w-7" /></div><h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8E827A]">This workspace is being prepared for your construction operations team.</p><span className="mt-5 inline-flex rounded-full bg-[#F3E9E1] px-3 py-1.5 text-xs font-semibold text-[#9A5E3A]">Coming soon</span></div></div></div></AppShell>
}
