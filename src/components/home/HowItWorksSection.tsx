import { useMemo, useState } from "react";
import { Magnifer, ChartSquare, CheckCircle } from "@solar-icons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useHomeContent } from "@/hooks/useSettings";

const THEME_PRIMARY = "hsl(var(--primary))";
const THEME_SECONDARY = "hsl(var(--secondary))";

type Step = {
  icon: typeof Magnifer;
  title: string;
  description: string;
  status: string;
  text?: string;
};

const defaultSteps: Step[] = [
  {
    icon: Magnifer,
    title: "Suchen",
    description: "Wähle deine Kategorie oder suche direkt nach deinem Bedarf.",
    status: "Kategorie oder Bedarf wählen",
  },
  {
    icon: ChartSquare,
    title: "Vergleichen",
    description: "Prüfe Anbieter, Konditionen und wichtige Unterschiede übersichtlich an einem Ort.",
    status: "Kriterien und Anbieter prüfen",
  },
  {
    icon: CheckCircle,
    title: "Entscheiden",
    description: "Öffne den passenden Vergleich und gehe strukturiert zum nächsten Schritt.",
    status: "Zum passenden Anbieter weitergehen",
  },
];

const cardBaseStyle: React.CSSProperties = {
  borderColor: "hsl(var(--primary) / 0.92)",
  boxShadow: "0 18px 48px hsl(var(--primary) / 0.08)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(250,247,240,0.92))",
};

const getCardHighlight = (active: boolean, final = false): React.CSSProperties => ({
  boxShadow: active
    ? `0 24px 60px ${final ? "hsl(var(--secondary) / 0.22)" : "hsl(var(--primary) / 0.14)"}, inset 0 0 0 1px ${final ? THEME_SECONDARY : THEME_PRIMARY}`
    : "0 18px 48px hsl(var(--primary) / 0.08)",
  borderColor: active ? (final ? THEME_SECONDARY : THEME_PRIMARY) : "hsl(var(--primary) / 0.92)",
});

const buildSteps = (howItWorks: any): Step[] => {
  const configuredSteps = Array.isArray(howItWorks.steps) && howItWorks.steps.length > 0
    ? howItWorks.steps
    : defaultSteps;

  return defaultSteps.map((fallback, index) => {
    const configured = configuredSteps[index] || {};

    return {
      ...fallback,
      ...configured,
      icon: fallback.icon,
      description: configured.description || configured.text || fallback.description,
      status: configured.status || fallback.status,
    };
  });
};

const SectionHeader = ({ howItWorks, shouldReduceMotion }: { howItWorks: any; shouldReduceMotion: boolean }) => (
  <motion.div
    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
    whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className="mx-auto mb-8 max-w-3xl text-center md:mb-12"
  >
    <div
      className="mx-auto inline-flex items-center gap-3 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] shadow-sm"
      style={{
        color: THEME_PRIMARY,
        borderColor: "hsl(var(--primary) / 0.22)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), hsl(var(--muted) / 0.72))",
        boxShadow: "0 10px 30px hsl(var(--primary) / 0.07)",
      }}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: THEME_SECONDARY, boxShadow: `0 0 0 6px hsl(var(--secondary) / 0.14)` }}
      />
      <span>{howItWorks.badge || "In 3 Schritten zum Vergleich"}</span>
    </div>

    <h2 className="mt-6 text-3xl font-display font-bold tracking-tight md:text-5xl" style={{ color: THEME_PRIMARY }}>
      {howItWorks.headline || "So funktioniert dieses Portal"}
    </h2>
    <p className="mt-4 text-lg text-slate-600">
      {howItWorks.subheadline || "In drei einfachen Schritten zur besten Entscheidung."}
    </p>
  </motion.div>
);

const SectionShell = ({ children }: { children: React.ReactNode }) => (
  <section className="relative overflow-hidden bg-card py-16 md:py-24 border-b border-border">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-56"
      style={{
        background: "radial-gradient(circle at top center, hsl(var(--primary) / 0.06), transparent 64%)",
      }}
    />
    <div className="container relative mx-auto px-4">{children}</div>
  </section>
);

const MorphIcon = ({ stage, active, shouldReduceMotion }: { stage: number; active: boolean; shouldReduceMotion: boolean }) => {
  if (stage === 0) {
    return (
      <motion.div
        className="relative h-12 w-12"
        animate={shouldReduceMotion ? {} : { scale: active ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}
      >
        <div className="absolute inset-[2px] rounded-full border-[4px] border-white" />
        <div className="absolute bottom-[6px] right-[5px] h-3.5 w-1 rounded-full bg-white rotate-[-42deg]" />
      </motion.div>
    );
  }

  if (stage === 1) {
    return (
      <div className="flex h-12 w-12 items-end justify-center gap-[5px]">
        {[0, 1, 2].map((bar) => (
          <motion.span
            key={bar}
            className="block w-[5px] rounded-full bg-white"
            animate={shouldReduceMotion ? {} : { height: active ? [16, 28, 18] : 16 + bar * 5 }}
            transition={{ duration: 1.1, repeat: active ? Infinity : 0, delay: bar * 0.12, ease: "easeInOut" }}
            style={{ height: 16 + bar * 5 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="relative h-12 w-12"
      animate={shouldReduceMotion ? {} : { scale: active ? [0.9, 1.08, 1] : 1 }}
      transition={{ duration: 1.5, repeat: active ? Infinity : 0, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute left-[12px] top-[20px] h-[4px] w-[10px] rounded-full bg-white rotate-45"
        animate={shouldReduceMotion ? {} : { opacity: active ? [0.2, 1, 1] : 1 }}
        transition={{ duration: 1.1, repeat: active ? Infinity : 0, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[18px] top-[17px] h-[4px] w-[18px] rounded-full bg-white rotate-[-48deg]"
        animate={shouldReduceMotion ? {} : { opacity: active ? [0.2, 1, 1] : 1 }}
        transition={{ duration: 1.1, repeat: active ? Infinity : 0, ease: "easeInOut", delay: 0.12 }}
      />
    </motion.div>
  );
};

const DesktopConnector = ({ active, shouldReduceMotion }: { active: boolean; shouldReduceMotion: boolean }) => (
  <div className="pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-20 hidden h-12 w-8 -translate-y-1/2 items-center md:flex xl:left-[calc(100%+0.75rem)] xl:w-10">
    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-slate-200">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${THEME_PRIMARY}, ${THEME_SECONDARY})` }}
        animate={{ width: active ? "100%" : "0%" }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
      />
    </div>
    <motion.span
      aria-hidden="true"
      className="absolute right-[-2px] flex h-6 w-6 items-center justify-center rounded-full border bg-white text-[13px] font-black"
      style={{
        color: active ? THEME_SECONDARY : "hsl(var(--muted-foreground) / 0.62)",
        borderColor: active ? "hsl(var(--secondary) / 0.45)" : "rgba(148,163,184,0.35)",
        boxShadow: active ? "0 10px 24px hsl(var(--secondary) / 0.18)" : "none",
      }}
      animate={shouldReduceMotion ? {} : { scale: active ? 1.06 : 1 }}
      transition={{ duration: 0.2 }}
    >
      →
    </motion.span>
  </div>
);

const MobileConnector = ({ active }: { active: boolean }) => (
  <div className="flex justify-center py-2 md:hidden" aria-hidden="true">
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-sm font-black shadow-sm"
      style={{
        color: active ? THEME_SECONDARY : THEME_PRIMARY,
        borderColor: active ? "hsl(var(--secondary) / 0.28)" : "hsl(var(--primary) / 0.16)",
      }}
    >
      ↓
    </span>
  </div>
);

const StepCard = ({
  step,
  index,
  activeIndex,
  shouldReduceMotion,
  onActivate,
}: {
  step: Step;
  index: number;
  activeIndex: number;
  shouldReduceMotion: boolean;
  onActivate: () => void;
}) => {
  const active = activeIndex === index;
  const final = index === 2;
  const Icon = step.icon;

  return (
    <motion.article
      tabIndex={0}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? {} : { y: -8, transition: { duration: 0.22 } }}
      className="group tt-glass-card relative h-full overflow-hidden rounded-[2rem] border px-6 pb-8 pt-7 text-center outline-none transition-shadow md:px-7 focus-visible:ring-2 focus-visible:ring-offset-4"
      style={{ ...cardBaseStyle, ...getCardHighlight(active, final) }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 transition-all duration-300"
        style={{
          background: final
            ? "linear-gradient(180deg, hsl(var(--secondary) / 0.12), transparent)"
            : "linear-gradient(180deg, hsl(var(--primary) / 0.06), transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${THEME_SECONDARY}, 0 20px 46px hsl(var(--secondary) / 0.16)` }}
      />

      <div className="relative z-10">
        <div
          className="mx-auto inline-flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: THEME_PRIMARY, borderColor: "hsl(var(--primary) / 0.18)", backgroundColor: "rgba(255,255,255,0.96)" }}
        >
          Schritt {index + 1}
        </div>

        <motion.div
          className="mx-auto mb-6 mt-5 flex h-20 w-20 items-center justify-center rounded-full border bg-white"
          style={{
            borderColor: final ? "hsl(var(--secondary) / 0.32)" : "hsl(var(--primary) / 0.18)",
            boxShadow: final ? "0 18px 42px hsl(var(--secondary) / 0.16)" : "0 18px 40px hsl(var(--primary) / 0.11)",
          }}
          animate={shouldReduceMotion ? {} : { y: active ? -4 : 0, scale: active ? 1.04 : 1 }}
          transition={{ duration: 0.32 }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: final
                ? `linear-gradient(135deg, ${THEME_SECONDARY} 0%, hsl(var(--secondary) / 0.88) 100%)`
                : `linear-gradient(135deg, ${THEME_PRIMARY} 0%, hsl(var(--primary) / 0.88) 100%)`,
              boxShadow: final ? "0 10px 24px hsl(var(--secondary) / 0.26)" : "0 10px 24px hsl(var(--primary) / 0.24)",
            }}
          >
            <span className="sr-only">{step.title}</span>
            <Icon weight="Bold" className="absolute h-0 w-0 opacity-0" aria-hidden="true" />
            <MorphIcon stage={index} active={active} shouldReduceMotion={shouldReduceMotion} />
          </div>
        </motion.div>

        <h3 className="text-2xl font-display font-bold tracking-tight" style={{ color: THEME_PRIMARY }}>
          {step.title}
        </h3>
        <p className="mx-auto mt-4 max-w-[18rem] text-[17px] leading-8 text-slate-600">
          {step.description}
        </p>

        <div
          className="mx-auto mt-6 inline-flex max-w-full items-center justify-center rounded-full border px-4 py-2 text-xs font-bold"
          style={{
            color: active ? THEME_PRIMARY : "hsl(var(--muted-foreground))",
            borderColor: active ? "hsl(var(--secondary) / 0.32)" : "hsl(var(--primary) / 0.12)",
            background: active ? "linear-gradient(135deg, hsl(var(--secondary) / 0.14), rgba(255,255,255,0.94))" : "hsl(var(--muted) / 0.9)",
          }}
        >
          {step.status}
        </div>
      </div>
    </motion.article>
  );
};

export const HowItWorksSection = () => {
  const { content } = useHomeContent();
  const howItWorks = content?.how_it_works || {};
  const shouldReduceMotion = Boolean(useReducedMotion());
  const steps = useMemo(() => buildSteps(howItWorks), [howItWorks]);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <SectionShell>
      <SectionHeader howItWorks={howItWorks} shouldReduceMotion={shouldReduceMotion} />

      <div className="-mx-4 md:hidden">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scroll-smooth overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="So funktioniert TierTarif Schritte"
        >
          {steps.map((step, index) => (
            <div
              key={`mobile-${step.title}-${index}`}
              className="w-[86vw] max-w-[28rem] flex-none snap-center"
              onClick={() => setActiveIndex(index)}
            >
              <StepCard
                step={step}
                index={index}
                activeIndex={activeIndex}
                shouldReduceMotion={shouldReduceMotion}
                onActivate={() => setActiveIndex(index)}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-center gap-2" aria-label="Slider Navigation">
          {steps.map((step, index) => (
            <button
              key={`dot-${step.title}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: activeIndex === index ? "2rem" : "0.65rem",
                backgroundColor: activeIndex === index ? THEME_SECONDARY : "hsl(var(--primary) / 0.18)",
              }}
              aria-label={`Schritt ${index + 1} anzeigen`}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-3 md:gap-8 xl:gap-10">
        {steps.map((step, index) => {
          const connectorActive = activeIndex >= index;

          return (
            <div key={`${step.title}-${index}`} className="relative">
              <StepCard
                step={step}
                index={index}
                activeIndex={activeIndex}
                shouldReduceMotion={shouldReduceMotion}
                onActivate={() => setActiveIndex(index)}
              />

              {index < steps.length - 1 && (
                <DesktopConnector active={connectorActive} shouldReduceMotion={shouldReduceMotion} />
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
};
