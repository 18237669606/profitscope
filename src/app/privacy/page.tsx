export const metadata = {
  title: "Privacy Policy — ProfitScope",
  description: "ProfitScope Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: May 20, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-semibold text-slate-800">1. Information We Collect</h2>
            <p className="mt-2">
              ProfitScope collects information you provide when using the service: email address for
              authentication, project data (client names, addresses, trade, rates, hours, costs), and
              subscription payment information processed by our payment partner, Creem.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">2. How We Use Your Information</h2>
            <p className="mt-2">
              Your email is used solely for account authentication via magic link. Project data is stored
              to provide the profit tracking service. We do not sell, share, or use your data for
              advertising or any purpose unrelated to operating the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">3. Data Storage</h2>
            <p className="mt-2">
              Your data is stored securely on Supabase infrastructure. Payment information is processed
              and stored by Creem, our Merchant of Record. We do not store your credit card or payment
              details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">4. Cookies</h2>
            <p className="mt-2">
              We use essential cookies for authentication (session management). No tracking or
              advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">5. Your Rights</h2>
            <p className="mt-2">
              You may request deletion of your account and all associated data at any time by contacting
              us at the support email below. We will comply within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">6. Contact</h2>
            <p className="mt-2">
              For privacy-related inquiries, contact us at{" "}
              <a href="mailto:1161698627@qq.com" className="text-blue-600 hover:underline">
                1161698627@qq.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
