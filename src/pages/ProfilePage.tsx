import { availabilityOptions, fieldOptions, precisionOptions, skillOptions } from "../config/profile";
import { PageHeader } from "../components/ui/PageHeader";
import { usePageTitle } from "../hooks/usePageTitle";

export function ProfilePage() {
  usePageTitle("প্রোফাইল");

  return (
    <section>
      <PageHeader title="প্রোফাইল" subtitle="প্রতিষ্ঠাতা বা টিমমেট হিসেবে দক্ষতা, আগ্রহ ও লোকেশন প্রেফারেন্স রাখুন।" />
      <div className="grid gap-4 lg:grid-cols-2">
        <input className="input input-bordered" placeholder="পাবলিক নাম" />
        <select className="select select-bordered" defaultValue="">
          <option value="" disabled>
            ক্ষেত্র নির্বাচন করুন
          </option>
          {fieldOptions.map((field) => (
            <option key={field}>{field}</option>
          ))}
        </select>
        <select className="select select-bordered">
          {availabilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select className="select select-bordered">
          {precisionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {skillOptions.map((skill) => (
          <span key={skill} className="badge badge-primary badge-outline">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
