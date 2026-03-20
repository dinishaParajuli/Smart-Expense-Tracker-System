function StatCard({ icon, label, value, delta, deltaType }) {
  const tone =
    deltaType === "positive"
      ? "text-emerald-300"
      : deltaType === "negative"
        ? "text-rose-300"
        : "text-sky-300";

  return (
    <article className="rounded-3xl border border-white/10 bg-[#111828] p-5 md:p-6 shadow-[0_20px_45px_-28px_rgba(2,6,23,0.9)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-white">{icon}</div>
        <span className={`text-2xl font-semibold ${tone}`}>{delta}</span>
      </div>
      <p className="text-3xl font-semibold leading-tight">{value}</p>
      <p className="mt-2 text-lg text-[#94a3b8]">{label}</p>
    </article>
  );
}

export default StatCard;
