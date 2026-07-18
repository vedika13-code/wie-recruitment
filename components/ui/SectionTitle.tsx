type SectionTitleProps = {
  eyebrow: string;
  title: string;
};

export default function SectionTitle({ eyebrow, title }: SectionTitleProps) {
  return (
    <div>
      <p className="text-xs tracking-[0.25em] text-purple-300/90 font-medium">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold leading-tight">{title}</h2>
    </div>
  );
}
