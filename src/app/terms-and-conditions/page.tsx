import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using JobAccess."
};

export default function TermsAndConditionsPage() {
  return (
    <ContentPage
      title="Terms & Conditions"
      description="By accessing this website, you agree to comply with these terms and conditions."
    >
      <div className="space-y-4 text-sm leading-relaxed">

        <p>
          By accessing and using JobAccess, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use this website.
        </p>

        <h2 className="font-semibold text-base">Use of Website</h2>
        <p>
          You agree to use this platform only for lawful purposes. Any misuse, including unauthorized access, automated abuse, scraping, or attempts to disrupt
          the website’s functionality, is strictly prohibited.
        </p>

        <h2 className="font-semibold text-base">Content Disclaimer</h2>
        <p>
          Job information is collected from publicly available and verified sources. While we strive for accuracy, content may change without notice. We reserve
          the right to edit, remove, or update listings at any time.
        </p>

        <h2 className="font-semibold text-base">No Guarantees</h2>
        <p>
          We do not guarantee the accuracy, completeness, or reliability of job listings. Users must verify all details from the official organization before
          applying.
        </p>

        <h2 className="font-semibold text-base">User Responsibility</h2>
        <p>
          You are solely responsible for any decisions or actions taken based on the information provided on this website.
        </p>

        <h2 className="font-semibold text-base">Intellectual Property</h2>
        <p>
          All content, including text, design, and layout, is the property of JobAccess unless otherwise stated. Unauthorized reproduction or distribution
          is not allowed.
        </p>

        <h2 className="font-semibold text-base">Third-Party Links</h2>
        <p>
          Our website may contain links to external websites. We are not responsible for the content, policies, or practices of third-party sites.
        </p>

        <h2 className="font-semibold text-base">Changes to Terms</h2>
        <p>
          We may update these Terms and Conditions at any time. Continued use of the website after changes means you accept the updated terms.
        </p>

        <h2 className="font-semibold text-base">Termination</h2>
        <p>
          We reserve the right to restrict or terminate access to our website at any time without notice if users violate these terms.
        </p>

      </div>
    </ContentPage>
  );
}
