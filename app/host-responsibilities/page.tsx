import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Link from "next/link";
import { BiCheckCircle, BiXCircle, BiInfoCircle } from "react-icons/bi";

const HostResponsibilitiesPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Host Responsibilities
            </h1>
            <p className="text-xl text-gray-700">
              As a Resound host, you play a crucial role in creating positive 
              rental experiences. Here&apos;s what we expect from our hosts.
            </p>
          </div>
        </Container>
      </div>

      {/* Core Responsibilities */}
      <Container>
        <div className="py-16">
          <Heading
            title="Your Core Responsibilities"
            subtitle="Essential commitments for all Resound hosts"
            center
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BiCheckCircle className="text-green-500 text-xl" />
                Accurate Listings
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Provide honest descriptions of instrument condition</li>
                <li>• Upload clear, current photos</li>
                <li>• Disclose any defects or issues</li>
                <li>• Keep availability calendar updated</li>
                <li>• List accurate pricing without hidden fees</li>
              </ul>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BiCheckCircle className="text-green-500 text-xl" />
                Responsive Communication
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Respond to inquiries within 24 hours</li>
                <li>• Communicate clearly and professionally</li>
                <li>• Coordinate pickup/return times promptly</li>
                <li>• Answer questions about your instruments</li>
                <li>• Keep all communication on-platform</li>
              </ul>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BiCheckCircle className="text-green-500 text-xl" />
                Safe Transactions
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Meet in safe, public locations</li>
                <li>• Verify renter identity at pickup</li>
                <li>• Document instrument condition together</li>
                <li>• Provide clear care instructions</li>
                <li>• Report any safety concerns immediately</li>
              </ul>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BiCheckCircle className="text-green-500 text-xl" />
                Quality Standards
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Maintain instruments in working condition</li>
                <li>• Clean instruments between rentals</li>
                <li>• Honor confirmed bookings</li>
                <li>• Be punctual for appointments</li>
                <li>• Provide a professional experience</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* Do's and Don'ts */}
      <div className="bg-gray-50 py-16">
        <Container>
          <Heading
            title="Hosting Do's and Don'ts"
            subtitle="Guidelines for successful hosting"
            center
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-green-700 flex items-center gap-2">
                <BiCheckCircle className="text-2xl" />
                Do&apos;s
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Screen renters by checking their profiles and reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Set clear expectations about instrument care</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Be flexible with pickup/return times when possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Leave honest reviews to help the community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Consider insurance for high-value instruments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Build relationships with repeat renters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Update your listings regularly</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6 text-red-700 flex items-center gap-2">
                <BiXCircle className="text-2xl" />
                Don&apos;ts
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Accept payments outside the Resound platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Misrepresent instrument condition or features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Cancel confirmed bookings without valid reason</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Share personal contact info before booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Discriminate against renters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>List instruments you don&apos;t own or have permission to rent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Ignore safety concerns or red flags</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Legal Considerations */}
      <Container>
        <div className="py-16">
          <Heading
            title="Legal Considerations"
            subtitle="Important information for hosts"
            center
          />
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BiInfoCircle className="text-amber-600 text-xl" />
                Ownership and Permission
              </h3>
              <p className="text-gray-700">
                You must own the instruments you list or have explicit permission from 
                the owner to rent them out. Listing stolen or borrowed instruments without 
                permission is illegal and will result in immediate account termination.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BiInfoCircle className="text-amber-600 text-xl" />
                Tax Obligations
              </h3>
              <p className="text-gray-700">
                Income earned through Resound may be taxable. Hosts are responsible for 
                understanding and meeting their tax obligations. We recommend consulting 
                with a tax professional about your specific situation.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BiInfoCircle className="text-amber-600 text-xl" />
                Insurance Recommendations
              </h3>
              <p className="text-gray-700">
                While Resound facilitates connections between hosts and renters, we do not 
                provide insurance coverage. Consider checking with your homeowner&apos;s or renter&apos;s 
                insurance about coverage for rented items, or explore specialized musical 
                instrument insurance.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BiInfoCircle className="text-amber-600 text-xl" />
                Local Regulations
              </h3>
              <p className="text-gray-700">
                Some cities or states may have specific regulations about peer-to-peer 
                rentals. It&apos;s your responsibility to understand and comply with local 
                laws and regulations in your area.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Consequences */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Maintaining Standards</h2>
            <p className="text-gray-700 mb-8">
              Hosts who consistently meet their responsibilities build successful rental 
              businesses on Resound. Those who violate our standards may face:
            </p>
            <div className="bg-white rounded-lg p-8 shadow-sm text-left">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span><strong>Warning:</strong> First-time minor violations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span><strong>Listing removal:</strong> For inaccurate or problematic listings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span><strong>Account suspension:</strong> For serious or repeated violations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span><strong>Permanent ban:</strong> For illegal activities or severe violations</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Support */}
      <Container>
        <div className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              We&apos;re here to support you in your hosting journey. If you have questions 
              about your responsibilities or need assistance, we&apos;re just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/host-resources"
                className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                View Host Resources
              </Link>
              <Link 
                href="/contact"
                className="px-8 py-3 bg-white text-amber-600 border-2 border-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HostResponsibilitiesPage;