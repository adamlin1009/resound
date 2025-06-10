import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Link from "next/link";
import { BiSearch, BiMessage, BiCalendar, BiShield, BiMusic, BiStar } from "react-icons/bi";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              How Resound Works
            </h1>
            <p className="text-xl text-gray-700">
              Renting musical instruments has never been easier. 
              Here's everything you need to know.
            </p>
          </div>
        </Container>
      </div>

      {/* For Renters Section */}
      <Container>
        <div className="py-16">
          <Heading
            title="For Renters"
            subtitle="Find and rent the perfect instrument in just a few steps"
          />
          
          <div className="mt-12 space-y-12 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiSearch className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Search for instruments</h3>
                <p className="text-gray-600 mb-3">
                  Browse our marketplace by instrument type, location, or specific needs. 
                  Use filters for condition rating, experience level, and price range.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• View detailed photos and descriptions</li>
                  <li>• Check availability calendar</li>
                  <li>• Read reviews from previous renters</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiCalendar className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Book your rental</h3>
                <p className="text-gray-600 mb-3">
                  Select your rental dates and proceed to secure checkout. 
                  Payment is processed safely through Stripe.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Choose flexible rental periods</li>
                  <li>• Secure payment processing</li>
                  <li>• Instant booking confirmation</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiMessage className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3. Connect with the owner</h3>
                <p className="text-gray-600 mb-3">
                  Use our messaging system to coordinate pickup details. 
                  Owners will provide pickup location and any special instructions.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• In-platform messaging</li>
                  <li>• Flexible pickup arrangements</li>
                  <li>• Get tips from the owner</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiMusic className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4. Enjoy and return</h3>
                <p className="text-gray-600 mb-3">
                  Make music with your rental! When your period ends, 
                  return the instrument as arranged with the owner.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Treat instruments with care</li>
                  <li>• Return on time</li>
                  <li>• Leave a helpful review</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* For Owners Section */}
      <div className="bg-gray-50 py-16">
        <Container>
          <Heading
            title="For Instrument Owners"
            subtitle="Share your instruments and earn extra income"
          />
          
          <div className="mt-12 space-y-12 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiMusic className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">1. List your instrument</h3>
                <p className="text-gray-600 mb-3">
                  Create a listing with photos, description, and rental price. 
                  Specify condition, experience level required, and availability.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Free to list</li>
                  <li>• Set your own prices</li>
                  <li>• Control availability calendar</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiShield className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Review and approve</h3>
                <p className="text-gray-600 mb-3">
                  When someone books, you'll receive a notification. 
                  Review the renter's profile and rental history.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Instant notifications</li>
                  <li>• Renter verification</li>
                  <li>• Message renters directly</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiMessage className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3. Coordinate handoff</h3>
                <p className="text-gray-600 mb-3">
                  Arrange pickup details through our secure messaging. 
                  Choose a convenient time and safe location.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Flexible scheduling</li>
                  <li>• Your choice of location</li>
                  <li>• Contactless options available</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BiStar className="text-xl text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4. Get paid and reviewed</h3>
                <p className="text-gray-600 mb-3">
                  Payments are released after successful pickup. 
                  Build your reputation with positive reviews.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Secure payments via Stripe</li>
                  <li>• Build your reputation</li>
                  <li>• Grow your rental business</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Safety & Trust Section */}
      <Container>
        <div className="py-16">
          <Heading
            title="Safety & Trust"
            subtitle="Your security is our priority"
            center
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiShield className="text-2xl text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Verified Users</h3>
              <p className="text-gray-600 text-sm">
                All users go through email verification. Build trust through reviews and rental history.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiMessage className="text-2xl text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Messaging</h3>
              <p className="text-gray-600 text-sm">
                All communication happens within our platform. Your personal contact info stays private.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiCalendar className="text-2xl text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Protected Payments</h3>
              <p className="text-gray-600 text-sm">
                Payments are processed securely through Stripe. Owners get paid after successful handoff.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* FAQ Preview */}
      <div className="bg-amber-50 py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Have questions?</h2>
            <p className="text-gray-700 mb-8">
              Check out our Help Center for detailed answers about rentals, 
              payments, safety, and more.
            </p>
            <Link 
              href="/help"
              className="inline-block px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Visit Help Center
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default HowItWorksPage;