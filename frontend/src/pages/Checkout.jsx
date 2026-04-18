import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Lock, CheckCircle2, CreditCard, Shield } from "lucide-react";
import { PRICING } from "@/lib/mock";
import { toast } from "sonner";

export default function Checkout() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(PRICING[1]);
    const [method, setMethod] = useState("card");
    const [processing, setProcessing] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            toast.success("Payment successful (demo)");
            navigate("/dashboard/payments");
        }, 1400);
    };

    return (
        <div className="min-h-screen bg-background text-foreground" data-testid="checkout-page">
            <header className="border-b border-white/10">
                <div className="container-hr h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg">HR Tunes</span>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock size={12} /> Secured checkout
                    </div>
                </div>
            </header>

            <div className="container-hr py-12">
                <button onClick={() => navigate(-1)} className="eyebrow flex items-center gap-2 mb-8 hover:text-primary transition-colors">
                    <ArrowLeft size={13} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left - plan + form */}
                    <form onSubmit={onSubmit} className="lg:col-span-7 space-y-10">
                        <section>
                            <div className="eyebrow mb-3">Step 01</div>
                            <h2 className="text-display text-4xl mb-6">Choose your plan.</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {PRICING.filter((p) => p.price > 0).map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelected(p)}
                                        className={`p-5 border text-left transition-all ${
                                            selected.id === p.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/15 hover:border-white/30"
                                        }`}
                                        data-testid={`plan-${p.id}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-sm">{p.name}</div>
                                            {selected.id === p.id && <CheckCircle2 size={14} className="text-primary" />}
                                        </div>
                                        <div className="text-heading font-black text-2xl mt-3">₹{p.price.toLocaleString("en-IN")}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.cadence}</div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="eyebrow mb-3">Step 02</div>
                            <h2 className="text-display text-4xl mb-6">Payment method.</h2>
                            <div className="flex gap-2 mb-6">
                                {[
                                    { id: "card", label: "Card" },
                                    { id: "upi", label: "UPI" },
                                    { id: "netbanking", label: "Net Banking" },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setMethod(m.id)}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${
                                            method === m.id
                                                ? "bg-primary text-white border-primary"
                                                : "border-white/20 hover:border-white/40"
                                        }`}
                                        data-testid={`method-${m.id}`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {method === "card" && (
                                <div className="space-y-5">
                                    <Field label="Cardholder name">
                                        <input required type="text" placeholder="Harsh Rajput" className="checkout-input" data-testid="card-name" />
                                    </Field>
                                    <Field label="Card number">
                                        <div className="relative">
                                            <input required type="text" placeholder="1234 5678 9012 3456" className="checkout-input pr-10" data-testid="card-number" />
                                            <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </Field>
                                    <div className="grid grid-cols-2 gap-5">
                                        <Field label="Expiry"><input required type="text" placeholder="MM/YY" className="checkout-input" data-testid="card-expiry" /></Field>
                                        <Field label="CVV"><input required type="text" placeholder="•••" className="checkout-input" data-testid="card-cvv" /></Field>
                                    </div>
                                </div>
                            )}

                            {method === "upi" && (
                                <div>
                                    <Field label="UPI ID">
                                        <input required type="text" placeholder="you@hdfc" className="checkout-input" data-testid="upi-id" />
                                    </Field>
                                </div>
                            )}

                            {method === "netbanking" && (
                                <Field label="Select bank">
                                    <select className="checkout-input">
                                        <option className="bg-card">HDFC Bank</option>
                                        <option className="bg-card">ICICI Bank</option>
                                        <option className="bg-card">Axis Bank</option>
                                        <option className="bg-card">State Bank of India</option>
                                    </select>
                                </Field>
                            )}
                        </section>

                        <section>
                            <div className="eyebrow mb-3">Step 03</div>
                            <h2 className="text-display text-4xl mb-6">Billing contact.</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="Full name"><input required type="text" placeholder="Harsh Rajput" className="checkout-input" data-testid="billing-name" /></Field>
                                <Field label="Email"><input required type="email" placeholder="you@hrtunes.in" className="checkout-input" data-testid="billing-email" /></Field>
                                <div className="sm:col-span-2">
                                    <Field label="Billing address"><input required type="text" placeholder="Street, city, state" className="checkout-input" /></Field>
                                </div>
                            </div>
                        </section>

                        <button type="submit" disabled={processing} className="btn-primary w-full !py-4" data-testid="pay-btn">
                            {processing ? "Processing…" : `Pay ₹${selected.price.toLocaleString("en-IN")}`}
                        </button>
                    </form>

                    {/* Right - summary */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                        <div className="card-hr p-8">
                            <div className="eyebrow mb-4">Order summary</div>
                            <div className="flex items-baseline justify-between mb-2">
                                <div>
                                    <div className="text-heading font-bold text-xl">{selected.name}</div>
                                    <div className="text-sm text-muted-foreground">{selected.tagline}</div>
                                </div>
                                <div className="text-heading font-black text-2xl">₹{selected.price.toLocaleString("en-IN")}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{selected.cadence}</div>

                            <ul className="mt-6 space-y-2">
                                {selected.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                                        <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <div className="divider-dashed my-6" />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{selected.price.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-muted-foreground">GST (18%)</span>
                                <span>₹{Math.round(selected.price * 0.18).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="divider-dashed my-4" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-heading font-bold text-lg">Total</span>
                                <span className="text-heading font-black text-3xl text-primary">
                                    ₹{Math.round(selected.price * 1.18).toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="mt-6 p-3 bg-white/5 border border-white/10 flex items-start gap-2 text-xs text-muted-foreground">
                                <Shield size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                <span>
                                    Your payment is processed over a 256-bit encrypted connection.
                                    Cancel anytime from your billing dashboard.
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <style>{`
                .checkout-input {
                    width: 100%;
                    background: hsl(0 0% 7%);
                    border: 1px solid hsl(0 0% 15%);
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .checkout-input:focus {
                    border-color: hsl(357 93% 47%);
                    box-shadow: 0 0 0 3px hsl(357 93% 47% / 0.15);
                }
                .checkout-input::placeholder { color: hsl(0 0% 40%); }
            `}</style>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="eyebrow block mb-2">{label}</span>
            {children}
        </label>
    );
}
