// Continues the component or data expression so its related values and behavior stay grouped together.
"use client";

// Continues the component or data expression so its related values and behavior stay grouped together.
import {
    // Continues the component or data expression so its related values and behavior stay grouped together.
    motion,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    useTransform,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    useReducedMotion,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    useMotionValue,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    useSpring,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    useScroll,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    type MotionValue,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from "framer-motion";
// Imports useEffect, useRef, useState from react so this module can reuse that component, helper, or library.
import { useEffect, useRef, useState } from "react";

// Stores the value in IMAGES so later lines can reuse this data or behavior for the current feature.
const IMAGES = [
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=1000&auto=format&fit=crop", title: "Skyline Tower A" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop", title: "Apex Heights" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop", title: "Grand Palms" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop", title: "Site Log Verified" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1000&auto=format&fit=crop", title: "Oberoi Enclave" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop", title: "Serene Villas" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop", title: "Verma Infra" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1000&auto=format&fit=crop", title: "Zenith Tech Park" },
    // Continues the component or data expression so its related values and behavior stay grouped together.
    { src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1000&auto=format&fit=crop", title: "Zero Wastage" },
// Continues the component or data expression so its related values and behavior stay grouped together.
];

// Continues the component or data expression so its related values and behavior stay grouped together.
interface TunnelCardData {
    // Sets the item field so the surrounding object or component receives this setting.
    item: { src: string; title: string };
    // Sets the angleCos field so the surrounding object or component receives this setting.
    angleCos: number;
    // Sets the angleSin field so the surrounding object or component receives this setting.
    angleSin: number;
    // Sets the radiusFactorX field so the surrounding object or component receives this setting.
    radiusFactorX: number;
    // Sets the radiusFactorY field so the surrounding object or component receives this setting.
    radiusFactorY: number;
    // Sets the rotationZ field so the surrounding object or component receives this setting.
    rotationZ: number;
    // Sets the index field so the surrounding object or component receives this setting.
    index: number;
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in TUNNEL_CARDS so later lines can reuse this data or behavior for the current feature.
const TUNNEL_CARDS: TunnelCardData[] = IMAGES.map((item, i) => {
    // Stores the value in goldenAngle so later lines can reuse this data or behavior for the current feature.
    const goldenAngle = i * 137.5 * (Math.PI / 180);
    // Stores the value in radiusFactorX so later lines can reuse this data or behavior for the current feature.
    const radiusFactorX = 0.28 + (i % 3) * 0.08;
    // Stores the value in radiusFactorY so later lines can reuse this data or behavior for the current feature.
    const radiusFactorY = 0.26 + (i % 2) * 0.09;

    // Returns the result so the caller or React receives the value or interface this function provides.
    return {
        // Continues the component or data expression so its related values and behavior stay grouped together.
        item,
        // Sets the angleCos field so the surrounding object or component receives this setting.
        angleCos: Math.cos(goldenAngle),
        // Sets the angleSin field so the surrounding object or component receives this setting.
        angleSin: Math.sin(goldenAngle),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        radiusFactorX,
        // Continues the component or data expression so its related values and behavior stay grouped together.
        radiusFactorY,
        // Sets the rotationZ field so the surrounding object or component receives this setting.
        rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
        // Sets the index field so the surrounding object or component receives this setting.
        index: i,
    // Closes the current block or object so the grouped statements or settings end here.
    };
// Continues the component or data expression so its related values and behavior stay grouped together.
});

// Stores the value in SPRING_CONFIG so later lines can reuse this data or behavior for the current feature.
const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

// Continues the component or data expression so its related values and behavior stay grouped together.
interface StageDimensions {
    // Sets the width field so the surrounding object or component receives this setting.
    width: number;
    // Sets the height field so the surrounding object or component receives this setting.
    height: number;
    // Sets the isMobile field so the surrounding object or component receives this setting.
    isMobile: boolean;
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines useCameraParallax so this module can perform its named task when needed.
function useCameraParallax(enabled: boolean) {
    // Stores the value in rawX so later lines can reuse this data or behavior for the current feature.
    const rawX = useMotionValue(0);
    // Stores the value in rawY so later lines can reuse this data or behavior for the current feature.
    const rawY = useMotionValue(0);
    // Stores the value in x so later lines can reuse this data or behavior for the current feature.
    const x = useSpring(rawX, SPRING_CONFIG);
    // Stores the value in y so later lines can reuse this data or behavior for the current feature.
    const y = useSpring(rawY, SPRING_CONFIG);

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    useEffect(() => {
        // Checks this condition before continuing so the code can choose the correct path for the current state.
        if (!enabled) return;
        // Stores the value in onMove so later lines can reuse this data or behavior for the current feature.
        const onMove = (e: PointerEvent) => {
            // Calls this helper or component so the feature can perform the operation or render the control represented here.
            rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
            // Calls this helper or component so the feature can perform the operation or render the control represented here.
            rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        // Closes the current block or object so the grouped statements or settings end here.
        };
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        window.addEventListener("pointermove", onMove, { passive: true });
        // Returns the result so the caller or React receives the value or interface this function provides.
        return () => window.removeEventListener("pointermove", onMove);
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }, [enabled, rawX, rawY]);

    // Returns the result so the caller or React receives the value or interface this function provides.
    return { x, y };
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
interface TunnelCardProps {
    // Sets the card field so the surrounding object or component receives this setting.
    card: TunnelCardData;
    // Sets the progress field so the surrounding object or component receives this setting.
    progress: MotionValue<number>;
    // Sets the pointer field so the surrounding object or component receives this setting.
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    // Sets the total field so the surrounding object or component receives this setting.
    total: number;
    // Sets the stage field so the surrounding object or component receives this setting.
    stage: StageDimensions;
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines TunnelCard so this module can perform its named task when needed.
function TunnelCard({ card, progress, pointer, total, stage }: TunnelCardProps) {
    // Stores the value in staggerSpan so later lines can reuse this data or behavior for the current feature.
    const staggerSpan = 0.55;
    // Stores the value in start so later lines can reuse this data or behavior for the current feature.
    const start = (card.index / total) * (1 - staggerSpan);
    // Stores the value in end so later lines can reuse this data or behavior for the current feature.
    const end = start + staggerSpan;

    // Stores the value in localProgress so later lines can reuse this data or behavior for the current feature.
    const localProgress = useTransform(progress, [start, end], [0, 1]);

    // Stores the value in farZ so later lines can reuse this data or behavior for the current feature.
    const farZ = stage.isMobile ? -1200 : -1700;
    // Stores the value in nearZ so later lines can reuse this data or behavior for the current feature.
    const nearZ = stage.isMobile ? 350 : 500;
    // Stores the value in z so later lines can reuse this data or behavior for the current feature.
    const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

    // Stores the value in opacity so later lines can reuse this data or behavior for the current feature.
    const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

    // Stores the value in cardWidth so later lines can reuse this data or behavior for the current feature.
    const cardWidth = stage.isMobile
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ? Math.max(130, Math.min(180, stage.width * 0.38))
        // Continues the component or data expression so its related values and behavior stay grouped together.
        : Math.max(180, Math.min(270, stage.width * 0.18));

    // Stores the value in baseX so later lines can reuse this data or behavior for the current feature.
    const baseX = card.angleCos * (stage.width * card.radiusFactorX);
    // Stores the value in baseY so later lines can reuse this data or behavior for the current feature.
    const baseY = card.angleSin * (stage.height * card.radiusFactorY);
    // Stores the value in panStrength so later lines can reuse this data or behavior for the current feature.
    const panStrength = stage.isMobile ? 20 : 45;

    // Stores the value in transform so later lines can reuse this data or behavior for the current feature.
    const transform = useTransform(
        // Continues the component or data expression so its related values and behavior stay grouped together.
        [z, pointer.x, pointer.y],
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ([currZ, px, py]: number[]) => {
            // Stores the value in offsetX so later lines can reuse this data or behavior for the current feature.
            const offsetX = baseX - px * panStrength;
            // Stores the value in offsetY so later lines can reuse this data or behavior for the current feature.
            const offsetY = baseY - py * panStrength;
            // Returns the result so the caller or React receives the value or interface this function provides.
            return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
        // Closes the current block or object so the grouped statements or settings end here.
        }
    // Closes this function call or grouped expression so the surrounding code can continue.
    );

    // Returns the result so the caller or React receives the value or interface this function provides.
    return (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <motion.div
            /* Sets the style property so this element receives the data or behavior required by this screen. */
            /* Sets the style property so this element receives the data or behavior required by this screen. */
            style={{
                /* Sets the width field so the surrounding object or component receives this setting. */
                /* Sets the width field so the surrounding object or component receives this setting. */
                width: cardWidth,
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                transform,
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                opacity,
                /* Sets the zIndex field so the surrounding object or component receives this setting. */
                /* Sets the zIndex field so the surrounding object or component receives this setting. */
                zIndex: card.index + 1,
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            }}
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer"
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        >
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-[#E8DCD4] shadow-xl ring-1 ring-[#323232]/15 transition-all duration-500 hover:ring-[#323232]/50 hover:shadow-2xl">
                {/* Starts the <img> element to display visual content. */}
                <img
                    /* Selects the image or other resource displayed by this element. */
                    src={card.item.src}
                    /* Sets the alt property so this element receives the data or behavior required by this screen. */
                    /* Sets the alt property so this element receives the data or behavior required by this screen. */
                    alt={card.item.title}
                    /* Sets the draggable property so this element receives the data or behavior required by this screen. */
                    /* Sets the draggable property so this element receives the data or behavior required by this screen. */
                    draggable={false}
                    /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                />
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-4 sm:p-5">
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span className="text-xs sm:text-sm font-mono tracking-widest uppercase text-white drop-shadow-md">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {card.item.title}
                    {/* Closes the <span> element so later content is no longer part of this region. */}
                    </span>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
        {/* Closes the <motion.div> element so later content is no longer part of this region. */}
        </motion.div>
    // Closes this function call or grouped expression so the surrounding code can continue.
    );
// Closes the current block or object so the grouped statements or settings end here.
}

// Exports function as this file’s default value so other modules can load the main feature.
export default function PerspectiveTunnelHero() {
    // Stores the value in containerRef so later lines can reuse this data or behavior for the current feature.
    const containerRef = useRef<HTMLDivElement>(null);
    // Stores the value in reduce so later lines can reuse this data or behavior for the current feature.
    const reduce = useReducedMotion();

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    const [stage, setStage] = useState<StageDimensions>({
        // Sets the width field so the surrounding object or component receives this setting.
        width: 1440,
        // Sets the height field so the surrounding object or component receives this setting.
        height: 900,
        // Sets the isMobile field so the surrounding object or component receives this setting.
        isMobile: false,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    });

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    useEffect(() => {
        // Stores the value in updateDimensions so later lines can reuse this data or behavior for the current feature.
        const updateDimensions = () => {
            // Calls this helper or component so the feature can perform the operation or render the control represented here.
            setStage({
                // Sets the width field so the surrounding object or component receives this setting.
                width: window.innerWidth,
                // Sets the height field so the surrounding object or component receives this setting.
                height: window.innerHeight,
                // Sets the isMobile field so the surrounding object or component receives this setting.
                isMobile: window.innerWidth < 768,
            // Continues the component or data expression so its related values and behavior stay grouped together.
            });
        // Closes the current block or object so the grouped statements or settings end here.
        };

        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        updateDimensions();
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        window.addEventListener("resize", updateDimensions);
        // Returns the result so the caller or React receives the value or interface this function provides.
        return () => window.removeEventListener("resize", updateDimensions);
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }, []);

    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    const { scrollYProgress } = useScroll({
        // Sets the target field so the surrounding object or component receives this setting.
        target: containerRef,
        // Sets the offset field so the surrounding object or component receives this setting.
        offset: ["start start", "end end"],
    // Continues the component or data expression so its related values and behavior stay grouped together.
    });

    // Stores the value in smoothProgress so later lines can reuse this data or behavior for the current feature.
    const smoothProgress = useSpring(scrollYProgress, {
        // Sets the stiffness field so the surrounding object or component receives this setting.
        stiffness: 80,
        // Sets the damping field so the surrounding object or component receives this setting.
        damping: 30,
        // Sets the restDelta field so the surrounding object or component receives this setting.
        restDelta: 0.0001,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    });

    // Stores the value in pointer so later lines can reuse this data or behavior for the current feature.
    const pointer = useCameraParallax(!reduce);

    // Stores the value in titleScale so later lines can reuse this data or behavior for the current feature.
    const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.7, 1, 1.35]);
    // Stores the value in titleOpacity so later lines can reuse this data or behavior for the current feature.
    const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0]);
    // Stores the value in promptOpacity so later lines can reuse this data or behavior for the current feature.
    const promptOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

    // Returns the result so the caller or React receives the value or interface this function provides.
    return (
        // Continues the component or data expression so its related values and behavior stay grouped together.
        <div
            /* Sets the ref property so this element receives the data or behavior required by this screen. */
            /* Sets the ref property so this element receives the data or behavior required by this screen. */
            ref={containerRef}
            /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
            className="relative h-[250vh] w-full bg-[#DDD0C8]"
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        /* Continues the component or data expression so its related values and behavior stay grouped together. */
        >
            {/* Starts the <div> element to organize this part of the interface. */}
            <div
                /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                className="sticky top-0 h-screen w-full overflow-hidden text-[#323232] select-none flex items-center justify-center"
                /* Sets the style property so this element receives the data or behavior required by this screen. */
                /* Sets the style property so this element receives the data or behavior required by this screen. */
                style={{
                    /* Sets the perspective field so the surrounding object or component receives this setting. */
                    /* Sets the perspective field so the surrounding object or component receives this setting. */
                    perspective: stage.isMobile ? "900px" : "1200px",
                    /* Sets the transformStyle field so the surrounding object or component receives this setting. */
                    /* Sets the transformStyle field so the surrounding object or component receives this setting. */
                    transformStyle: "preserve-3d",
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                }}
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            /* Continues the component or data expression so its related values and behavior stay grouped together. */
            >
                {/* Subtle Grid in Dark Grey */}
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#323232_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-20" />

                {/* Depth Ring Guides */}
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-[#323232]/15" />
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-[#323232]/20" />

                {/* Central Typography */}
                {/* Starts the <motion.div> element to organize this part of the interface. */}
                <motion.div
                    /* Sets the style property so this element receives the data or behavior required by this screen. */
                    /* Sets the style property so this element receives the data or behavior required by this screen. */
                    style={{ scale: titleScale, opacity: titleOpacity }}
                    /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                    className="pointer-events-none z-0 flex flex-col items-center text-center px-6 max-w-xl"
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                >
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="text-xs font-mono uppercase tracking-[0.4em] text-[#595552] mb-4">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        Builder Portfolio & Sites
                    {/* Closes the <p> element so later content is no longer part of this region. */}
                    </p>
                    {/* Starts the <h2> element to organize this part of the interface. */}
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[0.95] text-[#323232]">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        PROJECTS IN
                        {/* Starts the <br> element to organize this part of the interface. */}
                        <br />
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        MOTION.
                    {/* Closes the <h2> element so later content is no longer part of this region. */}
                    </h2>
                    {/* Starts the <p> element to organize this part of the interface. */}
                    <p className="mt-4 max-w-[36ch] text-sm sm:text-base font-light text-[#595552]">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        Continue scrolling to travel through live builder developments.
                    {/* Closes the <p> element so later content is no longer part of this region. */}
                    </p>
                {/* Closes the <motion.div> element so later content is no longer part of this region. */}
                </motion.div>

                {/* Scroll Prompt */}
                {/* Starts the <motion.div> element to organize this part of the interface. */}
                <motion.div
                    /* Sets the style property so this element receives the data or behavior required by this screen. */
                    /* Sets the style property so this element receives the data or behavior required by this screen. */
                    style={{ opacity: promptOpacity }}
                    /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                    className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-[#595552]"
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                >
                    {/* Starts the <span> element to organize this part of the interface. */}
                    <span>Scroll to Explore Sites</span>
                    {/* Starts the <div> element to organize this part of the interface. */}
                    <div className="h-6 w-px bg-gradient-to-b from-[#323232] to-transparent" />
                {/* Closes the <motion.div> element so later content is no longer part of this region. */}
                </motion.div>

                {/* 3D Z-Space Plane */}
                {/* Starts the <div> element to organize this part of the interface. */}
                <div
                    /* Applies utility classes so the element’s layout, spacing, and appearance match the design. */
                    className="absolute inset-0 pointer-events-none"
                    /* Sets the style property so this element receives the data or behavior required by this screen. */
                    /* Sets the style property so this element receives the data or behavior required by this screen. */
                    style={{ transformStyle: "preserve-3d" }}
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                /* Continues the component or data expression so its related values and behavior stay grouped together. */
                >
                    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                    {TUNNEL_CARDS.map((card, i) => (
                        // Continues the component or data expression so its related values and behavior stay grouped together.
                        <TunnelCard
                            /* Gives this rendered item a stable identity so React can update lists efficiently. */
                            key={i}
                            /* Sets the card property so this element receives the data or behavior required by this screen. */
                            /* Sets the card property so this element receives the data or behavior required by this screen. */
                            card={card}
                            /* Sets the progress property so this element receives the data or behavior required by this screen. */
                            /* Sets the progress property so this element receives the data or behavior required by this screen. */
                            progress={smoothProgress}
                            /* Sets the pointer property so this element receives the data or behavior required by this screen. */
                            /* Sets the pointer property so this element receives the data or behavior required by this screen. */
                            pointer={pointer}
                            /* Sets the total property so this element receives the data or behavior required by this screen. */
                            /* Sets the total property so this element receives the data or behavior required by this screen. */
                            total={TUNNEL_CARDS.length}
                            /* Sets the stage property so this element receives the data or behavior required by this screen. */
                            /* Sets the stage property so this element receives the data or behavior required by this screen. */
                            stage={stage}
                        /* Continues the component or data expression so its related values and behavior stay grouped together. */
                        /* Continues the component or data expression so its related values and behavior stay grouped together. */
                        />
                    // Continues the component or data expression so its related values and behavior stay grouped together.
                    ))}
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
    // Closes this function call or grouped expression so the surrounding code can continue.
    );
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the reusable perspective tunnel hero interface component.
