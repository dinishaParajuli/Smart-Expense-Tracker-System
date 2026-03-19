function StatCard({ icon, label, value, delta, deltaType }) {
  const tone =
    deltaType === "positive"
      ? "text-emerald-300"
      : deltaType === "negative"
        ? "text-rose-300"
        : "text-sky-300";

  return (
    <article className="card-glow rounded-3xl p-5 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--brand)]/90 text-white">{icon}</div>
        <span className={`text-2xl font-semibold ${tone}`}>{delta}</span>
      </div>
      <p className="text-3xl font-semibold leading-tight">{value}</p>
      <p className="mt-2 text-lg text-[var(--text-dim)]">{label}</p>
    </article>
  );
}

export default StatCard;
