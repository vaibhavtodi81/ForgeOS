// Imports motion, useReducedMotion, useScroll, useTransform from framer-motion so this module can reuse that component, helper, or library.
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
// Imports ArrowDown, HardHat from lucide-react so this module can reuse that component, helper, or library.
import { ArrowDown, HardHat } from 'lucide-react'
// Imports useRef from react so this module can reuse that component, helper, or library.
import { useRef } from 'react'

// Stores the value in scenes so later lines can reuse this data or behavior for the current feature.
const scenes = [
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the label field so the surrounding object or component receives this setting.
    label: 'FIELD NOTE 01',
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'The site never stands still.',
    // Sets the detail field so the surrounding object or component receives this setting.
    detail: 'People, materials, machines, and decisions move every hour.',
    // Sets the image field so the surrounding object or component receives this setting.
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=85',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the label field so the surrounding object or component receives this setting.
    label: 'FIELD NOTE 02',
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Make every movement visible.',
    // Sets the detail field so the surrounding object or component receives this setting.
    detail: 'Daily logs, stock balances, progress, and bills stay connected.',
    // Sets the image field so the surrounding object or component receives this setting.
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=2000&q=85',
  // Closes the current block or object so the grouped statements or settings end here.
  },
  // Opens a block or object so its related statements or settings can be grouped together.
  {
    // Sets the label field so the surrounding object or component receives this setting.
    label: 'FIELD NOTE 03',
    // Sets the title field so the surrounding object or component receives this setting.
    title: 'Build with a clearer view.',
    // Sets the detail field so the surrounding object or component receives this setting.
    detail: 'ForgeOS helps builders act before small problems become expensive ones.',
    // Sets the image field so the surrounding object or component receives this setting.
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85',
  // Closes the current block or object so the grouped statements or settings end here.
  },
// Continues the component or data expression so its related values and behavior stay grouped together.
]

// Continues the component or data expression so its related values and behavior stay grouped together.
interface StorySceneProps {
  // Sets the scene field so the surrounding object or component receives this setting.
  scene: (typeof scenes)[number]
  // Sets the index field so the surrounding object or component receives this setting.
  index: number
  // Sets the progress field so the surrounding object or component receives this setting.
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  // Sets the reduceMotion field so the surrounding object or component receives this setting.
  reduceMotion: boolean | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines StoryScene so this module can perform its named task when needed.
function StoryScene({ scene, index, progress, reduceMotion }: StorySceneProps) {
  // Stores the value in start so later lines can reuse this data or behavior for the current feature.
  const start = index / scenes.length
  // Stores the value in middle so later lines can reuse this data or behavior for the current feature.
  const middle = (index + 0.5) / scenes.length
  // Stores the value in end so later lines can reuse this data or behavior for the current feature.
  const end = (index + 1) / scenes.length
  // Stores the value in fadeStart so later lines can reuse this data or behavior for the current feature.
  const fadeStart = index === 0 ? 0 : start - 0.08
  // Stores the value in fadeEnd so later lines can reuse this data or behavior for the current feature.
  const fadeEnd = index === scenes.length - 1 ? 1 : end + 0.08
  // Stores the value in opacity so later lines can reuse this data or behavior for the current feature.
  const opacity = useTransform(
    // Continues the component or data expression so its related values and behavior stay grouped together.
    progress,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    [fadeStart, start, middle, end, fadeEnd],
    // Continues the component or data expression so its related values and behavior stay grouped together.
    [index === 0 ? 1 : 0, 1, 1, 1, index === scenes.length - 1 ? 1 : 0],
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
  // Stores the value in textY so later lines can reuse this data or behavior for the current feature.
  const textY = useTransform(progress, [start, middle, end], [40, 0, -40])

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <motion.div className="absolute inset-0" style={{ opacity }}>
      {/* Starts the <img> element to display visual content. */}
      <img src={scene.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="absolute inset-0 bg-[#323232]/65" />
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#323232]/85 via-transparent to-[#323232]" />
      {/* Starts the <motion.div> element to organize this part of the interface. */}
      <motion.div
        /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
        className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center text-[#DDD0C8]"
        /* Sets the style property so this element receives the data or behavior required by this screen. */
        /* Sets the style property so this element receives the data or behavior required by this screen. */
        style={reduceMotion ? undefined : { y: textY }}
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      /* Continues the component or data expression so its related values and behavior stay grouped together. */
      >
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.35em] text-[#DDD0C8]/75 sm:text-sm">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {scene.label}
        {/* Closes the <p> element so later content is no longer part of this region. */}
        </p>
        {/* Starts the <h2> element to organize this part of the interface. */}
        <h2 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {scene.title}
        {/* Closes the <h2> element so later content is no longer part of this region. */}
        </h2>
        {/* Starts the <p> element to organize this part of the interface. */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#DDD0C8]/80 sm:text-xl">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {scene.detail}
        {/* Closes the <p> element so later content is no longer part of this region. */}
        </p>
      {/* Closes the <motion.div> element so later content is no longer part of this region. */}
      </motion.div>
    {/* Closes the <motion.div> element so later content is no longer part of this region. */}
    </motion.div>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines SiteStoryReveal so this module can perform its named task when needed.
export function SiteStoryReveal() {
  // Stores the value in sectionRef so later lines can reuse this data or behavior for the current feature.
  const sectionRef = useRef<HTMLElement>(null)
  // Stores the value in reduceMotion so later lines can reuse this data or behavior for the current feature.
  const reduceMotion = useReducedMotion()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { scrollYProgress } = useScroll({
    // Sets the target field so the surrounding object or component receives this setting.
    target: sectionRef,
    // Sets the offset field so the surrounding object or component receives this setting.
    offset: ['start start', 'end end'],
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })
  // Stores the value in promptOpacity so later lines can reuse this data or behavior for the current feature.
  const promptOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <section ref={sectionRef} className="relative h-[260vh] bg-[#323232]">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {scenes.map((scene, index) => (
          // Continues the component or data expression so its related values and behavior stay grouped together.
          <StoryScene
            /* Gives this rendered item a stable identity so React can update lists efficiently. */
            key={scene.label}
            /* Sets the scene property so this element receives the data or behavior required by this screen. */
            /* Sets the scene property so this element receives the data or behavior required by this screen. */
            scene={scene}
            /* Sets the index property so this element receives the data or behavior required by this screen. */
            /* Sets the index property so this element receives the data or behavior required by this screen. */
            index={index}
            /* Sets the progress property so this element receives the data or behavior required by this screen. */
            /* Sets the progress property so this element receives the data or behavior required by this screen. */
            progress={scrollYProgress}
            /* Sets the reduceMotion property so this element receives the data or behavior required by this screen. */
            /* Sets the reduceMotion property so this element receives the data or behavior required by this screen. */
            reduceMotion={reduceMotion}
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          /* Continues the component or data expression so its related values and behavior stay grouped together. */
          />
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ))}

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="absolute left-6 right-6 top-8 z-10 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#DDD0C8]/75 sm:left-10 sm:right-10 sm:top-10">
          {/* Starts the <span> element to organize this part of the interface. */}
          <span className="flex items-center gap-2"><HardHat className="h-4 w-4" />ForgeOS / Site Stories</span>
          {/* Starts the <span> element to organize this part of the interface. */}
          <span>Scroll sequence</span>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>

        {/* Starts the <motion.div> element to organize this part of the interface. */}
        <motion.div
          /* Sets the style property so this element receives the data or behavior required by this screen. */
          /* Sets the style property so this element receives the data or behavior required by this screen. */
          style={{ opacity: reduceMotion ? 0 : promptOpacity }}
          /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-center text-xs uppercase tracking-[0.25em] text-[#DDD0C8]/75"
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        >
          {/* Starts the <span> element to organize this part of the interface. */}
          <span>Scroll to move through the site</span>
          {/* Starts the <ArrowDown> element to organize this part of the interface. */}
          <ArrowDown className="h-4 w-4 animate-bounce" />
        {/* Closes the <motion.div> element so later content is no longer part of this region. */}
        </motion.div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <section> element so later content is no longer part of this region. */}
    </section>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}

// Exports SiteStoryReveal as this file’s default value so other modules can load the main feature.
export default SiteStoryReveal
// File purpose: Renders the reusable SiteStoryReveal interface component.
