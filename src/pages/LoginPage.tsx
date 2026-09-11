import { PageHeader } from "../components/ui/PageHeader";
import { usePageTitle } from "../hooks/usePageTitle";

export function LoginPage() {
  usePageTitle("লগইন");

  return (
    <section>
      <PageHeader title="অ্যাকাউন্ট" subtitle="এই টেমপ্লেটে auth API contract রাখা হয়েছে; বাস্তব সংযোগ পরের ধাপে হবে।" />
      <div className="card max-w-xl border border-base-300 bg-base-100">
        <form className="card-body space-y-3">
          <input className="input input-bordered" type="email" placeholder="ইমেইল" />
          <input className="input input-bordered" type="password" placeholder="পাসওয়ার্ড" />
          <button className="btn btn-primary" type="button">
            লগইন
          </button>
        </form>
      </div>
    </section>
  );
}
