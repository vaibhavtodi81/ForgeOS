import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, HardHat } from 'lucide-react'
import { useRef } from 'react'

const scenes = [
  {
    label: 'FIELD NOTE 01',
    title: 'The site never stands still.',
    detail: 'People, materials, machines, and decisions move every hour.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=85',
  },
  {
    label: 'FIELD NOTE 02',
    title: 'Make every movement visible.',
    detail: 'Daily logs, stock balances, progress, and bills stay connected.',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=2000&q=85',
  },
  {
    label: 'FIELD NOTE 03',
    title: 'Build with a clearer view.',
    detail: 'ForgeOS helps builders act before small problems become expensive ones.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85',
  },
]

interface StorySceneProps {
  scene: (typeof scenes)[number]
  index: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  reduceMotion: boolean | null
}

function StoryScene({ scene, index, progress, reduceMotion }: StorySceneProps) {
  const start = index / scenes.length
  const middle = (index + 0.5) / scenes.length
  const end = (index + 1) / scenes.length
  const fadeStart = index === 0 ? 0 : start - 0.08
  const fadeEnd = index === scenes.length - 1 ? 1 : end + 0.08
  const opacity = useTransform(
    progress,
    [fadeStart, start, middle, end, fadeEnd],
    [index === 0 ? 1 : 0, 1, 1, 1, index === scenes.length - 1 ? 1 : 0],
  )
  const textY = useTransform(progress, [start, middle, end], [40, 0, -40])

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <img src={scene.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#323232]/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#323232]/85 via-transparent to-[#323232]" />
      <motion.div
        className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center text-[#DDD0C8]"
        style={reduceMotion ? undefined : { y: textY }}
      >
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.35em] text-[#DDD0C8]/75 sm:text-sm">
          {scene.label}
        </p>
        <h2 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          {scene.title}
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#DDD0C8]/80 sm:text-xl">
          {scene.detail}
        </p>
      </motion.div>
    </motion.div>
  )
}

export function SiteStoryReveal() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const promptOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    <section ref={sectionRef} className="relative h-[260vh] bg-[#323232]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {scenes.map((scene, index) => (
          <StoryScene
            key={scene.label}
            scene={scene}
            index={index}
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        ))}

        <div className="absolute left-6 right-6 top-8 z-10 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#DDD0C8]/75 sm:left-10 sm:right-10 sm:top-10">
          <span className="flex items-center gap-2"><HardHat className="h-4 w-4" />ForgeOS / Site Stories</span>
          <span>Scroll sequence</span>
        </div>

        <motion.div
          style={{ opacity: reduceMotion ? 0 : promptOpacity }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-center text-xs uppercase tracking-[0.25em] text-[#DDD0C8]/75"
        >
          <span>Scroll to move through the site</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}

export default SiteStoryReveal
