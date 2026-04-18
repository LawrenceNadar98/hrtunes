import DashboardLayout from "@/components/layout/DashboardLayout";
import { PAYMENT_HISTORY, PRICING } from "@/lib/mock";
import { CreditCard, Download, Calendar, CheckCircle2, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Payments() {
    const current = PRICING.find((p) => p.id === "monthly");
    return (
        <DashboardLayout
            subtitle="Billing"
            title="Payments"
            actions={
                <Link to="/checkout" className="btn-primary" data-testid="payments-upgrade">
                    <Zap size={14} /> Upgrade plan
                </Link>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 card-hr p-8" data-testid="current-plan">
                    <div className="eyebrow mb-3">Current plan</div>
                    <div className="flex flex-wrap items-baseline gap-4">
                        <h3 className="text-display text-5xl">{current.name}</h3>
                        <span className="text-heading font-bold text-2xl text-primary">
                            ₹{current.price.toLocaleString("en-IN")}{current.cadence}
                        </span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{current.tagline} — renews on Mar 1, 2026</p>

                    <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {current.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 size={15} className="text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-white/80">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/checkout" className="btn-outline" data-testid="change-plan">Change plan</Link>
                        <button className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4">
                            Cancel subscription
                        </button>
                    </div>
                </div>

                <div className="card-hr p-8" data-testid="payment-method">
                    <div className="eyebrow mb-3">Payment method</div>
                    <div className="flex items-center gap-4 p-4 border border-white/10">
                        <div className="w-12 h-8 bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                            VISA
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-sm">•••• •••• •••• 4242</div>
                            <div className="text-xs text-muted-foreground">Expires 08/28</div>
                        </div>
                        <CreditCard size={16} className="text-muted-foreground" />
                    </div>
                    <button className="mt-4 w-full btn-outline">Update card</button>
                </div>
            </div>

            <section data-testid="payment-history">
                <h2 className="text-heading font-bold text-xl mb-4">Billing History</h2>
                <div className="card-hr overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/5">
                        <div className="col-span-3 eyebrow">Invoice</div>
                        <div className="col-span-3 eyebrow">Date</div>
                        <div className="col-span-2 eyebrow">Plan</div>
                        <div className="col-span-2 eyebrow">Amount</div>
                        <div className="col-span-2 eyebrow text-right">Receipt</div>
                    </div>
                    {PAYMENT_HISTORY.map((p) => (
                        <div
                            key={p.id}
                            className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                            data-testid={`history-${p.id}`}
                        >
                            <div className="col-span-2 md:col-span-3 font-mono text-xs">{p.id}</div>
                            <div className="col-span-2 md:col-span-3 text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar size={12} />
                                {new Date(p.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                            <div className="col-span-1 md:col-span-2 text-sm">{p.plan}</div>
                            <div className="col-span-1 md:col-span-2 text-sm font-bold">₹{p.amount.toLocaleString("en-IN")}</div>
                            <div className="col-span-2 md:col-span-2 md:text-right">
                                <button className="inline-flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-widest hover:gap-2 transition-all">
                                    <Download size={12} /> PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </DashboardLayout>
    );
}
