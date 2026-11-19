import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart3, FolderKanban, UsersRound } from 'lucide-react'
import {
  DashboardCard,
  ProgressBar,
  SectionTitle,
  Skeleton,
  Sparkline,
  StatCard,
  StatusPill,
} from '@/forgeos/features/app-shell/components/dashboard-ui'

describe('DashboardCard', () => {
  test('renders its children inside the card container', () => {
    render(
      <DashboardCard>
        <p>Card body</p>
      </DashboardCard>,
    )
    expect(screen.getByText('Card body')).toBeInTheDocument()
  })

  test('the featured tone applies the featured card class', () => {
    render(
      <DashboardCard tone="featured">
        <p>Featured body</p>
      </DashboardCard>,
    )
    expect(screen.getByText('Featured body').closest('div')).toHaveClass('dashboard-card-featured')
  })

  test('the default tone does not apply the featured class and merges className', () => {
    render(
      <DashboardCard className="p-6">
        <p>Plain body</p>
      </DashboardCard>,
    )
    const card = screen.getByText('Plain body').closest('div')
    expect(card).not.toHaveClass('dashboard-card-featured')
    expect(card).toHaveClass('dashboard-card', 'p-6')
  })
})

describe('StatCard', () => {
  test('renders the label, value and note with the icon', () => {
    render(
      <StatCard
        label="Total projects"
        value="12"
        note="Accessible project records"
        icon={FolderKanban}
      />,
    )

    expect(screen.getByText('Total projects')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Accessible project records')).toBeInTheDocument()
    expect(screen.getByText('Total projects').closest('.dashboard-stat-card')?.querySelector('svg')).not.toBeNull()
  })

  test('the accent maps to a dashboard-icon class', () => {
    render(<StatCard label="Active" value="3" note="note" icon={UsersRound} accent="green" />)
    const icon = document.querySelector('.dashboard-icon-green')
    expect(icon).not.toBeNull()
  })
})

describe('SectionTitle', () => {
  test('renders the title as a heading plus the description', () => {
    render(
      <SectionTitle title="Recent progress updates" description="Daily-log history returned by the project progress API." />,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Recent progress updates' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Daily-log history returned by the project progress API.'),
    ).toBeInTheDocument()
  })

  test('renders an optional action node', () => {
    render(
      <SectionTitle
        title="Recent activity"
        action={<button type="button">View all</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
  })
})

describe('StatusPill', () => {
  test('renders its children inside a pill', () => {
    render(<StatusPill>Active</StatusPill>)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Active')).toHaveClass('dashboard-pill')
  })

  test('applies the requested tone class', () => {
    render(<StatusPill tone="green">42%</StatusPill>)
    expect(screen.getByText('42%')).toHaveClass('dashboard-pill-green')
  })
})

describe('ProgressBar', () => {
  test('exposes the completion percentage via aria-label', () => {
    render(<ProgressBar value={40} />)
    expect(screen.getByLabelText('40% complete')).toBeInTheDocument()
  })

  test('the fill width reflects the value', () => {
    render(<ProgressBar value={65} />)
    const fill = document.querySelector('.dashboard-progress-fill')
    expect(fill).not.toBeNull()
    expect(fill).toHaveStyle({ width: '65%' })
  })

  test('the color variant maps to a fill class', () => {
    const { rerender } = render(<ProgressBar value={10} color="red" />)
    expect(document.querySelector('.dashboard-progress-red')).not.toBeNull()

    rerender(<ProgressBar value={10} color="green" />)
    expect(document.querySelector('.dashboard-progress-green')).not.toBeNull()
  })
})

describe('Sparkline', () => {
  test('renders an accessible image with the provided label', () => {
    render(<Sparkline points="M0 60 L120 20 L240 30" label="Spend trend" />)
    expect(screen.getByRole('img', { name: 'Spend trend' })).toBeInTheDocument()
    // One fill path + one line path
    expect(document.querySelectorAll('svg path')).toHaveLength(2)
  })
})

describe('Skeleton', () => {
  test('renders an aria-hidden placeholder with the skeleton class', () => {
    render(
      <div>
        <Skeleton className="h-4 w-24" />
      </div>,
    )
    const skeleton = document.querySelector('.dashboard-skeleton') as HTMLElement | null
    expect(skeleton).not.toBeNull()
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    expect(skeleton).toHaveClass('h-4', 'w-24')
  })
})

describe('dashboard-ui composition', () => {
  test('the pieces compose into a realistic stat block', () => {
    render(
      <DashboardCard tone="featured">
        <SectionTitle title="Portfolio overview" description="Everything under control." />
        <StatCard label="On hold" value="1" note="Based on backend project status" icon={BarChart3} />
        <ProgressBar value={80} />
        <StatusPill tone="amber">On hold</StatusPill>
      </DashboardCard>,
    )

    expect(screen.getByRole('heading', { name: 'Portfolio overview' })).toBeInTheDocument()
    // "On hold" appears twice by design: as the StatCard label eyebrow and as
    // the StatusPill content.
    const onHold = screen.getAllByText('On hold')
    expect(onHold).toHaveLength(2)
    expect(onHold[1]).toHaveClass('dashboard-pill', 'dashboard-pill-amber')
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByLabelText('80% complete')).toBeInTheDocument()
  })
})
