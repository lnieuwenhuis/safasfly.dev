export function PrivacyPage() {
  return (
    <section className="card max-w-4xl border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body space-y-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Legal</p>
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
          Privacy Policy
        </h2>
        <p className="text-base-content/80">
          Contact and lead form submissions are stored to process inquiries, provide requested resources, and deliver
          project proposals.
        </p>
        <p className="text-base-content/80">
          Analytics events are used for product and funnel improvement and do not include payment information.
        </p>
        <p className="text-base-content/80">You can request data deletion by emailing the address listed on the contact page.</p>
      </div>
    </section>
  );
}
