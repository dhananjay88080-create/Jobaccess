import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for JobAccess."
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPage title="Privacy Policy" description="Effective Date: April 8, 2026">
      <div className="space-y-4 text-sm leading-relaxed">

        <p>
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use JobAccess.
        </p>

        <h2 className="font-semibold text-base">1. Information We Collect</h2>
        <p>
          We may collect limited information such as email addresses for job alerts, basic usage data (like pages visited, browser type, and IP address),
          and security logs to maintain and improve our service.
        </p>

        <h2 className="font-semibold text-base">2. How We Use Information</h2>
        <p>
          We use collected data to provide job notifications, improve website performance, enhance user experience, and communicate important updates.
        </p>

        <h2 className="font-semibold text-base">3. Cookies</h2>
        <p>
          We use cookies to store user preferences and optimize content. You can choose to disable cookies through your browser settings.
        </p>

        <h2 className="font-semibold text-base">4. Third-Party Services</h2>
        <p>
          We may use third-party services such as analytics tools, hosting providers, and advertising networks. These services may collect and process
          data according to their own privacy policies.
        </p>

        <h2 className="font-semibold text-base">5. Google AdSense</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google’s use
          of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.
        </p>
        <p>
          Users may opt out of personalized advertising by visiting Google Ads Settings.
        </p>

        <h2 className="font-semibold text-base">6. Data Protection</h2>
        <p>
          We implement reasonable technical and organizational measures to protect your data. However, no method of transmission over the Internet is
          completely secure.
        </p>

        <h2 className="font-semibold text-base">7. User Rights</h2>
        <p>
          You have the right to request access, correction, or deletion of your personal data. You may also unsubscribe from job alerts at any time.
        </p>

        <h2 className="font-semibold text-base">8. Children's Information</h2>
        <p>
          We do not knowingly collect any personal information from children under the age of 13.
        </p>

        <h2 className="font-semibold text-base">9. Consent</h2>
        <p>
          By using our website, you hereby consent to our Privacy Policy and agree to its terms.
        </p>

        <h2 className="font-semibold text-base">10. Updates</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page.
        </p>

        <h2 className="font-semibold text-base">11. Contact Us</h2>
        <p>
          If you have any questions regarding this policy, you can contact us at: <br />
          <strong>Email:</strong> your@email.com
        </p>

      </div>
    </ContentPage>
  );
}
