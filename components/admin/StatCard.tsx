export default function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="relative border border-[#d8b28c]/15 px-6 py-5">
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#d8b28c]/40" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#d8b28c]/40" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#d8b28c]/40" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#d8b28c]/40" />
      <p className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] mb-1">{label}</p>
      <p className="font-[family-name:var(--font-playfair)] text-3xl text-[#d8b28c]">{value}</p>
      {sub && <p className="text-xs text-[#5a5248] mt-1">{sub}</p>}
    </div>
  );
}
