import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Link from "next/link";
import { BiShield, BiUserCheck, BiMessageDetail, BiLockAlt, BiAlarm, BiHelpCircle } from "react-icons/bi";

const SafetyPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Safety at Resound
            </h1>
            <p className="text-xl text-gray-700">
              Your safety is our top priority. Learn about our safety features 
              and best practices for secure rentals.
            </p>
          </div>
        </Container>
      </div>

      {/* Safety Features */}
      <Container>
        <div className="py-16">
          <Heading
            title="Built-in Safety Features"
            subtitle="How we protect our community"
            center
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <BiUserCheck className="text-3xl text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Verified Profiles</h3>
                <p className="text-gray-600">
                  All users must verify their email address. Build trust through 
                  reviews and successful rental history.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <BiMessageDetail className="text-3xl text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Secure Messaging</h3>
                <p className="text-gray-600">
                  Keep all communication within our platform. Your personal 
                  contact information stays private until you choose to share it.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <BiLockAlt className="text-3xl text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
                <p className="text-gray-600">
                  All transactions are processed through Stripe with bank-level 
                  encryption. We never store your payment details.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <BiAlarm className="text-3xl text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Report any concerns through our platform. Our team reviews 
                  all reports and takes appropriate action quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Best Practices */}
      <div className="bg-gray-50 py-16">
        <Container>
          <Heading
            title="Safety Best Practices"
            subtitle="Tips for safe and successful rentals"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-amber-900">For Renters</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Read reviews and check the owner&apos;s rental history before booking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Meet in safe, public locations for instrument handoff</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Inspect the instrument and document any existing damage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Keep all communication within the Resound platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Never send money outside of our secure payment system</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Report any suspicious behavior immediately</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-amber-900">For Owners</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Verify renter profiles and check their rental history</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Choose safe, public meeting locations for handoffs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Take photos of your instrument before each rental</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Clearly communicate care instructions and expectations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Consider insurance for high-value instruments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span>Leave honest reviews to help the community</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Meeting Guidelines */}
      <Container>
        <div className="py-16">
          <Heading
            title="Safe Meeting Guidelines"
            subtitle="Recommendations for instrument handoffs"
            center
          />
          
          <div className="max-w-3xl mx-auto mt-8 bg-amber-50 rounded-lg p-8">
            <h3 className="font-semibold text-lg mb-4">Recommended Meeting Locations</h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Music stores or instrument shops</li>
              <li>• Public libraries or community centers</li>
              <li>• Coffee shops or restaurants</li>
              <li>• Well-lit parking lots with security cameras</li>
              <li>• Building lobbies with security personnel</li>
            </ul>
            
            <h3 className="font-semibold text-lg mb-4">During the Meeting</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Bring a friend if you feel more comfortable</li>
              <li>• Trust your instincts - if something feels wrong, cancel the meeting</li>
              <li>• Test the instrument together before completing the handoff</li>
              <li>• Document the condition with photos or video</li>
              <li>• Confirm pickup in the app once you&apos;ve received the instrument</li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Emergency Contacts */}
      <div className="bg-red-50 py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <BiShield className="text-5xl text-red-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">In Case of Emergency</h2>
            <p className="text-gray-700 mb-6">
              If you&apos;re in immediate danger, contact local authorities first:
            </p>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-2xl font-bold text-red-600 mb-2">911</p>
              <p className="text-gray-600">Emergency Services (US)</p>
            </div>
            <p className="mt-6 text-gray-700">
              For non-emergency safety concerns on Resound, 
              <Link href="/report" className="text-amber-600 hover:underline ml-1">
                report the issue here
              </Link>.
            </p>
          </div>
        </Container>
      </div>

      {/* Report Section */}
      <Container>
        <div className="py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Help Us Keep Resound Safe</h2>
            <p className="text-gray-700 mb-8">
              If you encounter any safety issues or violations of our community standards, 
              please report them immediately. We review all reports and take appropriate action.
            </p>
            <Link 
              href="/report"
              className="inline-block px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Report a Safety Issue
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SafetyPage;