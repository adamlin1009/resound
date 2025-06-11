import Container from "@/components/Container";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-700">
              Last updated: January 2025
            </p>
          </div>
        </Container>
      </div>

      {/* Privacy Content */}
      <Container>
        <div className="py-16 max-w-4xl mx-auto">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="mb-6 text-gray-700">
              At Resound, we take your privacy seriously. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our service. 
              Please read this policy carefully to understand our views and practices regarding 
              your personal data.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-2">Information You Provide:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Profile information (photo, bio, location)</li>
              <li>Listing information (instrument details, photos, availability)</li>
              <li>Communication between users through our messaging system</li>
              <li>Payment information (processed by Stripe)</li>
              <li>Reviews and ratings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">Information Collected Automatically:</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="mb-3 text-gray-700">We use your information to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide and maintain our Service</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative information and updates</li>
              <li>Respond to customer service requests</li>
              <li>Improve and personalize user experience</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect and prevent fraudulent activity</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
            <p className="mb-3 text-gray-700">We may share your information with:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Other Users:</strong> Your profile, listings, and reviews are visible to other users</li>
              <li><strong>Service Providers:</strong> Third parties who help us operate our Service (e.g., Stripe for payments, Uploadthing for image hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              <li><strong>Consent:</strong> With your explicit consent for other purposes</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="mb-6 text-gray-700">
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or 
              destruction. However, no method of transmission over the Internet is 100% secure, 
              and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold mb-4">6. Your Rights and Choices</h2>
            <p className="mb-3 text-gray-700">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Object to or restrict certain processing</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable cookies through your browser settings</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
            <p className="mb-6 text-gray-700">
              We use cookies and similar tracking technologies to track activity on our Service 
              and hold certain information. Cookies are files with small amounts of data that 
              are commonly used as anonymous unique identifiers. You can instruct your browser 
              to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h2 className="text-2xl font-bold mb-4">8. Third-Party Services</h2>
            <p className="mb-6 text-gray-700">
              Our Service may contain links to third-party websites or services that are not 
              operated by us. We have no control over and assume no responsibility for the 
              content, privacy policies, or practices of any third-party sites or services.
            </p>

            <h2 className="text-2xl font-bold mb-4">9. Children&apos;s Privacy</h2>
            <p className="mb-6 text-gray-700">
              Our Service is not intended for use by children under the age of 18. We do not 
              knowingly collect personal information from children under 18. If you become 
              aware that a child has provided us with personal information, please contact us.
            </p>

            <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
            <p className="mb-6 text-gray-700">
              Your information may be transferred to and maintained on servers located outside 
              of your state, province, country, or other governmental jurisdiction where data 
              protection laws may differ. Your consent to this Privacy Policy followed by your 
              submission of such information represents your agreement to that transfer.
            </p>

            <h2 className="text-2xl font-bold mb-4">11. Data Retention</h2>
            <p className="mb-6 text-gray-700">
              We retain personal information for as long as necessary to provide our services 
              and fulfill the purposes outlined in this policy. When we no longer need personal 
              information, we securely delete or anonymize it.
            </p>

            <h2 className="text-2xl font-bold mb-4">12. Changes to This Policy</h2>
            <p className="mb-6 text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the &quot;Last 
              updated&quot; date. You are advised to review this Privacy Policy periodically for 
              any changes.
            </p>

            <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
            <p className="mb-6 text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us through our 
              <a href="/contact" className="text-amber-600 hover:underline ml-1">Contact page</a>.
            </p>

            <h2 className="text-2xl font-bold mb-4">14. California Privacy Rights</h2>
            <p className="mb-6 text-gray-700">
              California residents have additional rights under the California Consumer Privacy 
              Act (CCPA), including the right to know what personal information we collect, 
              the right to delete personal information, and the right to opt-out of the sale 
              of personal information (which we do not do).
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPage;