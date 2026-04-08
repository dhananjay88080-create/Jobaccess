import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about JobAccess and our legal-first job aggregation approach."
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      description="JobAccess provides reliable and timely job updates using legal and verified data sources."
    >
      <div className="space-y-4 text-sm leading-relaxed">

        <p>
          JobAccess is a dedicated platform designed to help job seekers find the latest job opportunities in a simple and
          reliable way.
        </p>

        <h2 className="font-semibold text-base">What We Do</h2>
        <p>
          We collect job information from official sources such as government websites, public RSS feeds, and verified announcements. Our goal is to make
          job discovery easy by organizing all important details in one place.
        </p>

        <h2 className="font-semibold text-base">Our Approach</h2>
        <p>
          We follow a legal-first approach. We do not use unauthorized scraping or restricted data sources. Every job listing is either sourced from public
          data or reviewed before being published to ensure accuracy and compliance.
        </p>

        <h2 className="font-semibold text-base">Why Choose Us</h2>
        <p>
          - Clean and fast user experience <br />
          - Regular updates of latest jobs, admit cards, and results <br />
          - Easy-to-read job details with important dates and eligibility <br />
          - Mobile-friendly platform for quick access anywhere
        </p>

        <h2 className="font-semibold text-base">Our Mission</h2>
        <p>
          Our mission is to provide a trustworthy, transparent, and user-friendly platform for job seekers while maintaining compliance with all policies
          and best practices.
        </p>

        <h2 className="font-semibold text-base">Disclaimer</h2>
        <p>
          JobAccess is an informational platform only. We are not affiliated with any government organization. Users are advised to always verify
          details from official websites before applying.
        </p>

      </div>
    </ContentPage>
  );
}
