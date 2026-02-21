import { useTradeLogs } from "@/hooks/useTradeLogs";

function formatCurrency(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${value.toFixed(2)}`;
}

export default function TradeLogsPanel() {
  const { data, isLoading } = useTradeLogs();

  if (isLoading && !data) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">Loading trade history...</div>;
  }

  if (!data) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">Trade log data unavailable.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.2fr] gap-5">
      <aside className="story-card p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[1.15rem] text-[hsl(var(--foreground))]">Performance Snapshot</h3>
          {data.isDemo && (
            <span className="text-[0.58rem] uppercase tracking-[0.12em] px-2 py-1 rounded-full bg-zinc-200 text-zinc-700">
              Demo
            </span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatTile label="Total Trades" value={String(data.stats.totalTrades)} />
          <StatTile label="Win Rate" value={`${data.stats.winRate.toFixed(1)}%`} />
          <StatTile label="Realized PnL" value={formatCurrency(data.stats.realizedPnl)} positive={data.stats.realizedPnl >= 0} />
          <StatTile label="Avg Trade" value={formatCurrency(data.stats.avgPnl)} positive={data.stats.avgPnl >= 0} />
        </div>

        <p className="mt-6 text-[0.82rem] text-[hsl(var(--muted-foreground))] leading-relaxed">
          Every execution is recorded with timestamp, side, strategy, and realized outcome so you can tune your automation loop from evidence instead of intuition.
        </p>
      </aside>

      <section className="story-card p-6 sm:p-8">
        <h4 className="text-[1.05rem] text-[hsl(var(--foreground))]">Recent Trade Logs</h4>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[hsl(var(--card-border))]">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-white/70">
              <tr>
                {"Time,Pair,Side,Strategy,Status,PnL".split(",").map((label) => (
                  <th key={label} className="px-3 py-3 text-[0.58rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))] font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.logs.map((log) => (
                <tr key={log.id} className="border-t border-[hsl(var(--card-border))] bg-white/45">
                  <td className="px-3 py-3 text-[0.72rem] text-[hsl(var(--muted-foreground))]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-3 py-3 text-[0.78rem] text-[hsl(var(--foreground))]">{log.pair}</td>
                  <td className={`px-3 py-3 text-[0.72rem] font-medium ${log.side === "LONG" ? "text-emerald-700" : "text-rose-700"}`}>
                    {log.side}
                  </td>
                  <td className="px-3 py-3 text-[0.74rem] text-[hsl(var(--muted-foreground))]">{log.strategy}</td>
                  <td className="px-3 py-3 text-[0.68rem] text-[hsl(var(--foreground))]">{log.status}</td>
                  <td className={`px-3 py-3 text-[0.74rem] font-medium ${log.pnl >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {formatCurrency(log.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value, positive = true }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-white/60 p-4">
      <p className="text-[0.6rem] uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className={`mt-2 text-[1.1rem] ${label.includes("PnL") || label.includes("Avg") ? (positive ? "text-emerald-700" : "text-rose-700") : "text-[hsl(var(--foreground))]"}`}>
        {value}
      </p>
    </div>
  );
}
