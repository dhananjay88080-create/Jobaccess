import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for JobAccess."
};

export default function DisclaimerPage() {
  return (
    <ContentPage
      title="Disclaimer"
      description="Important notice regarding job information accuracy, source ownership, and limitations of liability."
    >
      <div className="space-y-4 text-sm leading-relaxed">

        <p>
          JobAccess is an independent informational platform that provides updates on government jobs, results, admit cards, and related information.
          We are not affiliated with any government organization, agency, or recruitment authority.
        </p>

        <h2 className="font-semibold text-base">Information Accuracy</h2>
        <p>
          While we strive to provide accurate and up-to-date information, we do not guarantee the completeness, reliability, or accuracy of any job listing.
          Users are strongly advised to verify all details from the official website of the respective organization before applying.
        </p>

        <h2 className="font-semibold text-base">No Recruitment Role</h2>
        <p>
          We do not conduct recruitment, accept job applications, or charge any fees for job listings. All applications must be submitted through official
          government portals or authorized platforms.
        </p>

        <h2 className="font-semibold text-base">External Links</h2>
        <p>
          Our website may contain links to third-party or official websites. We do not control or take responsibility for the content, policies, or accuracy
          of those external sites.
        </p>

        <h2 className="font-semibold text-base">Copyright & Ownership</h2>
        <p>
          All logos, trademarks, and names belong to their respective owners. Any content used from third-party sources is for informational and educational
          purposes only.
        </p>

        <h2 className="font-semibold text-base">Limitation of Liability</h2>
        <p>
          JobAccess shall not be held responsible for any loss, damage, or inconvenience caused due to reliance on the information provided on this
          website, including missed deadlines or incorrect data.
        </p>

        <h2 className="font-semibold text-base">User Responsibility</h2>
        <p>
          By using this website, you acknowledge that it is your responsibility to verify all job-related information from official sources before making any
          decisions or taking action.
        </p>

      </div>
    </ContentPage>
  );
}
