export const metadata = {
  title: "Terms of Service — ProfitScope",
  description: "ProfitScope Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: May 20, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-semibold text-slate-800">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using ProfitScope, you agree to be bound by these Terms of Service. If you
              do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">2. Description of Service</h2>
            <p className="mt-2">
              ProfitScope is a profit tracking tool for contractors. It allows you to create projects,
              calculate quotes, track material and subcontractor costs, and view net profit and margin.
              PDF export of project reports is included.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">3. Subscription & Payments</h2>
            <p className="mt-2">
              ProfitScope is offered as a subscription at $12/month with a 7-day free trial. Payments are
              processed by Creem, our Merchant of Record. You may cancel at any time. Upon cancellation,
              access continues until the end of the current billing period. No refunds are provided for
              partial months.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">4. User Responsibilities</h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your login credentials and for
              all activity under your account. You agree not to misuse the service or use it for any
              unlawful purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">5. Limitation of Liability</h2>
            <p className="mt-2">
              ProfitScope is provided on an "as is" basis. We make no warranties regarding the accuracy
              of calculations or availability of the service. We are not liable for any damages arising
              from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">6. Termination</h2>
            <p className="mt-2">
              We reserve the right to suspend or terminate accounts that violate these terms. You may
              terminate your account at any time by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">7. Changes to Terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">8. Contact</h2>
            <p className="mt-2">
              For questions about these terms, contact us at{" "}
              <a href="mailto:profitscope@qq.com" className="text-blue-600 hover:underline">
                profitscope@qq.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
