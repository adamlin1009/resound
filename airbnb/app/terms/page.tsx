import Container from "@/components/Container";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-700">
              Last updated: January 2025
            </p>
          </div>
        </Container>
      </div>

      {/* Terms Content */}
      <div className="bg-white">
        <Container>
          <div className="py-16 max-w-4xl mx-auto">
            <div className="max-w-none">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Acceptance of Terms</h2>
            <p className="mb-6 text-gray-700">
              By accessing or using Resound ("the Service"), you agree to be bound by these 
              Terms of Service ("Terms"). If you do not agree to these Terms, please do not 
              use the Service.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Service Description</h2>
            <p className="mb-6 text-gray-700">
              Resound is a marketplace platform that connects musical instrument owners 
              ("Hosts") with individuals seeking to rent instruments ("Renters"). We facilitate 
              these connections but are not a party to the rental agreements between users.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. User Accounts</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>You must be at least 18 years old to use the Service</li>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized account use</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Listing and Booking</h2>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">For Hosts:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>You must own or have permission to rent the instruments you list</li>
              <li>Listings must be accurate and not misleading</li>
              <li>You must honor confirmed bookings</li>
              <li>You are responsible for setting your own prices and terms</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 text-gray-900">For Renters:</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>You must treat rented instruments with care</li>
              <li>You must return instruments on time and in the same condition</li>
              <li>You are responsible for any damage beyond normal wear</li>
              <li>You must comply with the Host's rental terms</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Payments</h2>
            <p className="mb-6 text-gray-700">
              All payments are processed through our third-party payment provider, Stripe. 
              By using the Service, you agree to Stripe's terms and conditions. Resound 
              charges a service fee on transactions, which will be clearly displayed before 
              booking completion.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Cancellations and Refunds</h2>
            <p className="mb-6 text-gray-700">
              Cancellation policies are set by individual Hosts and displayed on each listing. 
              Renters should review these policies before booking. Refunds will be processed 
              according to the applicable cancellation policy.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. User Conduct</h2>
            <p className="mb-3 text-gray-700">Users agree not to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Create false or misleading content</li>
              <li>Attempt to circumvent the platform for transactions</li>
              <li>Use the Service for any unauthorized commercial purposes</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Liability Limitations</h2>
            <p className="mb-6 text-gray-700">
              Resound is not responsible for the condition, quality, safety, or legality of 
              listed instruments. We are not responsible for the truth or accuracy of listings, 
              the ability of Hosts to rent instruments, or the ability of Renters to pay for 
              rentals. Users engage with each other at their own risk.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Indemnification</h2>
            <p className="mb-6 text-gray-700">
              You agree to indemnify and hold Resound harmless from any claims, damages, or 
              expenses arising from your use of the Service, your violation of these Terms, 
              or your violation of any rights of another party.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Privacy</h2>
            <p className="mb-6 text-gray-700">
              Your use of the Service is also governed by our Privacy Policy, which describes 
              how we collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">11. Modifications</h2>
            <p className="mb-6 text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users 
              of significant changes. Continued use of the Service after changes constitutes 
              acceptance of the modified Terms.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">12. Termination</h2>
            <p className="mb-6 text-gray-700">
              We may terminate or suspend your account at any time for violations of these 
              Terms or for any other reason at our discretion. You may also delete your 
              account at any time.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">13. Governing Law</h2>
            <p className="mb-6 text-gray-700">
              These Terms are governed by the laws of the United States and the State of 
              California, without regard to conflict of law principles.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">14. Contact Information</h2>
            <p className="mb-6 text-gray-700">
              If you have questions about these Terms, please contact us through our 
              <a href="/contact" className="text-amber-600 hover:underline ml-1">Contact page</a>.
            </p>
          </div>
        </div>
      </Container>
      </div>
    </div>
  );
};

export default TermsPage;