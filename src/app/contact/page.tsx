import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact JobAccess for support, feedback, corrections, and partnership inquiries."
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact Us"
      description="We are here to help. Reach out to us for support, corrections, or business inquiries."
    >
      <div className="space-y-4 text-sm leading-relaxed">

        <p>
          If you have any questions, feedback, or need assistance, feel free to contact us using the details below.
        </p>

        <h2 className="font-semibold text-base">Support</h2>
        <p>
          Email: <strong>support@jobaccess.in</strong><br />
          For general queries, technical issues, or help using the website.
        </p>

        <h2 className="font-semibold text-base">Corrections & Updates</h2>
        <p>
          If you find any incorrect or outdated job information, please email us with:
          <br />- Job Title <br />- Source Link <br />- Description of the issue
          <br />
          Our team will review and update it as soon as possible.
        </p>

        <h2 className="font-semibold text-base">Business & Partnerships</h2>
        <p>
          Email: <strong>partnerships@jobaccess.in</strong><br />
          For collaborations, advertising, or official source partnerships.
        </p>

        <h2 className="font-semibold text-base">Response Time</h2>
        <p>
          We usually respond within <strong>24–72 business hours</strong>.
        </p>

        <h2 className="font-semibold text-base">Admin Access</h2>
        <p>
          For internal or urgent review updates, authorized users can access the admin panel at{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/admin/login">
            /admin/login
          </Link>.
        </p>

      </div>
    </ContentPage>
  );
}
