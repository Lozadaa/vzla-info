export function PageIntro({
  eyebrow,
  title,
  lead,
  accent = "var(--color-azul)",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  accent?: string;
}) {
  return (
    <section className="shell-narrow pt-8 pb-6">
      <p className="eyebrow" style={{ color: accent }}>
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[2rem] sm:text-[2.5rem] font-extrabold leading-[1.05]">
        {title}
      </h1>
      {lead && (
        <p className="mt-3 text-lg text-[var(--color-ink-soft)]">{lead}</p>
      )}
    </section>
  );
}
