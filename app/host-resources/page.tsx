import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Link from "next/link";
import { BiBookOpen, BiCamera, BiDollar, BiMessageSquare, BiShield, BiTrophy } from "react-icons/bi";

const HostResourcesPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Host Resources
            </h1>
            <p className="text-xl text-gray-700">
              Everything you need to know to become a successful instrument host on Resound
            </p>
          </div>
        </Container>
      </div>

      {/* Quick Start Guide */}
      <Container>
        <div className="py-16">
          <Heading
            title="Quick Start Guide"
            subtitle="Get your first listing up in minutes"
            center
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Prepare Your Instrument</h3>
              <p className="text-gray-600 text-sm">
                Clean your instrument, check it's in good working condition, and gather 
                any accessories you'll include (case, cables, music stand, etc.)
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Create Your Listing</h3>
              <p className="text-gray-600 text-sm">
                Take quality photos, write a detailed description, set your price and 
                availability. Be honest about condition and requirements.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Manage Bookings</h3>
              <p className="text-gray-600 text-sm">
                Respond to inquiries promptly, coordinate pickup/return times, and 
                provide a great experience to earn positive reviews.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Best Practices */}
      <div className="bg-gray-50 py-16">
        <Container>
          <Heading
            title="Hosting Best Practices"
            subtitle="Tips from successful hosts"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <BiCamera className="text-3xl text-amber-600 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Photography Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use natural lighting when possible</li>
                <li>• Show the instrument from multiple angles</li>
                <li>• Include close-ups of any wear or damage</li>
                <li>• Show included accessories</li>
                <li>• Keep backgrounds clean and uncluttered</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <BiDollar className="text-3xl text-amber-600 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Pricing Strategy</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Research similar instruments in your area</li>
                <li>• Consider daily, weekly, and monthly rates</li>
                <li>• Factor in instrument value and condition</li>
                <li>• Offer discounts for longer rentals</li>
                <li>• Adjust prices based on demand</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <BiMessageSquare className="text-3xl text-amber-600 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Communication</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Respond to messages within 24 hours</li>
                <li>• Be clear about pickup/return process</li>
                <li>• Share care instructions</li>
                <li>• Set expectations upfront</li>
                <li>• Be friendly and professional</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <BiShield className="text-3xl text-amber-600 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Protecting Your Instrument</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Document condition before each rental</li>
                <li>• Meet renters in safe locations</li>
                <li>• Consider insurance for valuable items</li>
                <li>• Check renter reviews and history</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <BiTrophy className="text-3xl text-amber-600 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Building Success</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Maintain instruments in top condition</li>
                <li>• Earn positive reviews consistently</li>
                <li>• Update availability regularly</li>
                <li>• Offer competitive rates</li>
                <li>• Build relationships with repeat renters</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <BiBookOpen className="text-3xl text-amber-600 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Listing Optimization</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Write detailed, honest descriptions</li>
                <li>• List all included accessories</li>
                <li>• Specify experience level required</li>
                <li>• Update calendar frequently</li>
                <li>• Use relevant keywords</li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Sample Listing Description */}
      <Container>
        <div className="py-16">
          <Heading
            title="Sample Listing Description"
            subtitle="Example of a well-written instrument listing"
            center
          />
          
          <div className="max-w-3xl mx-auto mt-8 bg-amber-50 rounded-lg p-8">
            <h3 className="font-semibold text-lg mb-4">Yamaha YAS-280 Alto Saxophone</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Overview:</strong> Perfect student/intermediate alto saxophone in excellent 
                condition. Ideal for high school students, adult beginners, or anyone needing a 
                quality instrument for performances or practice.
              </p>
              <p>
                <strong>Condition (8/10):</strong> Well-maintained with normal signs of use. All 
                pads seal properly, keys move smoothly, and the lacquer has minor wear spots. 
                Recently serviced by a professional technician.
              </p>
              <p>
                <strong>Included:</strong> Hard case, neck strap, mouthpiece with ligature and cap, 
                cleaning swab, and cork grease. I'll also include 3 Rico reeds to get you started.
              </p>
              <p>
                <strong>Requirements:</strong> Basic saxophone knowledge recommended (Experience Level 2+). 
                Please handle with care and return clean.
              </p>
              <p>
                <strong>Pickup/Return:</strong> Flexible scheduling in downtown area. Can meet at 
                local music store for your comfort. Happy to demonstrate the instrument and answer questions.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Resources and Tools */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Heading
              title="Helpful Resources"
              subtitle="Tools and guides for successful hosting"
              center
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <Link 
                href="/host-responsibilities"
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">Host Responsibilities</h3>
                <p className="text-gray-600">
                  Understand your obligations as a host, including safety, communication, 
                  and maintaining quality standards.
                </p>
              </Link>
              
              <Link 
                href="/help"
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">FAQ for Hosts</h3>
                <p className="text-gray-600">
                  Find answers to common questions about hosting, payments, cancellations, 
                  and platform policies.
                </p>
              </Link>
              
              <Link 
                href="/safety"
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">Safety Guidelines</h3>
                <p className="text-gray-600">
                  Learn about our safety features and best practices for protecting 
                  yourself and your instruments.
                </p>
              </Link>
              
              <Link 
                href="/contact"
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">Host Support</h3>
                <p className="text-gray-600">
                  Need help with hosting? Contact our support team for assistance 
                  with listings, bookings, or technical issues.
                </p>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Call to Action */}
      <Container>
        <div className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to start hosting?</h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Join our community of instrument owners who are helping musicians 
              access quality instruments while earning extra income.
            </p>
            <Link 
              href="/instruments"
              className="inline-block px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              List Your First Instrument
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HostResourcesPage;