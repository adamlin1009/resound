import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { BiTime, BiCheckCircle, BiXCircle, BiInfoCircle } from "react-icons/bi";

const CancellationPolicyPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Cancellation Policy
            </h1>
            <p className="text-xl text-gray-700">
              Understanding cancellations and refunds on Resound
            </p>
          </div>
        </Container>
      </div>

      {/* Overview */}
      <Container>
        <div className="py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-12">
              <div className="flex items-start gap-3">
                <BiInfoCircle className="text-amber-600 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-lg mb-2">Important Note</h2>
                  <p className="text-gray-700">
                    Each host sets their own cancellation policy for their listings. 
                    Always check the specific cancellation terms on a listing before booking. 
                    This page outlines our standard policies and how cancellations work.
                  </p>
                </div>
              </div>
            </div>

            <Heading
              title="For Renters"
              subtitle="How to cancel a reservation and get refunded"
            />

            {/* Renter Cancellation Timeline */}
            <div className="mt-8 space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <BiTime className="text-amber-600 text-xl" />
                  Standard Cancellation Timeline
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">48+ hours before pickup</h4>
                      <p className="text-gray-600">Full refund minus service fees</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">24-48 hours before pickup</h4>
                      <p className="text-gray-600">50% refund (host keeps 50%)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">Less than 24 hours before pickup</h4>
                      <p className="text-gray-600">No refund (host keeps 100%)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">How to Cancel</h3>
                <ol className="space-y-2 text-gray-700">
                  <li>1. Go to your <a href="/rentals" className="text-amber-600 hover:underline">Rentals</a> page</li>
                  <li>2. Find the reservation you want to cancel</li>
                  <li>3. Click "Cancel Reservation"</li>
                  <li>4. Select a cancellation reason</li>
                  <li>5. Confirm the cancellation</li>
                </ol>
                <p className="mt-4 text-sm text-gray-600">
                  Refunds are typically processed within 5-10 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* For Hosts */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Heading
              title="For Hosts"
              subtitle="Setting cancellation policies and handling cancellations"
            />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Available Policies</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-amber-600">Flexible</h4>
                    <p className="text-sm text-gray-600">Full refund up to 24 hours before</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-600">Standard (Recommended)</h4>
                    <p className="text-sm text-gray-600">Full refund up to 48 hours before</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-600">Strict</h4>
                    <p className="text-sm text-gray-600">50% refund up to 7 days before</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Host Cancellations</h3>
                <p className="text-gray-700 mb-3">
                  Hosts should avoid cancelling confirmed bookings. If you must cancel:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <BiXCircle className="text-red-500 mt-0.5" />
                    <span>Renter receives full refund</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BiXCircle className="text-red-500 mt-0.5" />
                    <span>May impact your host reputation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BiXCircle className="text-red-500 mt-0.5" />
                    <span>Calendar may be blocked for those dates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Special Circumstances */}
      <Container>
        <div className="py-16">
          <div className="max-w-4xl mx-auto">
            <Heading
              title="Special Circumstances"
              subtitle="Exceptions to standard cancellation policies"
              center
            />

            <div className="mt-8 space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <BiCheckCircle className="text-green-500" />
                  Extenuating Circumstances
                </h3>
                <p className="text-gray-700 mb-3">
                  Full refunds may be issued regardless of the cancellation policy for:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Serious illness or injury (documentation required)</li>
                  <li>• Death of immediate family member</li>
                  <li>• Natural disasters affecting the rental area</li>
                  <li>• Government-mandated travel restrictions</li>
                  <li>• Significant undisclosed issues with the instrument</li>
                </ul>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <BiInfoCircle className="text-amber-600" />
                  Dispute Resolution
                </h3>
                <p className="text-gray-700">
                  If you believe a cancellation was handled incorrectly or have special 
                  circumstances not covered by the standard policy, please 
                  <a href="/contact" className="text-amber-600 hover:underline mx-1">contact our support team</a> 
                  with documentation. We review each case individually and strive to find 
                  fair solutions for both parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Heading
              title="Frequently Asked Questions"
              subtitle="Common questions about cancellations"
              center
            />

            <div className="mt-8 space-y-4">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-2">When do I receive my refund?</h3>
                <p className="text-gray-600">
                  Refunds are initiated immediately upon cancellation and typically appear 
                  in your account within 5-10 business days, depending on your bank.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-2">Are service fees refundable?</h3>
                <p className="text-gray-600">
                  Service fees are generally non-refundable unless the cancellation qualifies 
                  for extenuating circumstances or the host cancels the booking.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-2">Can I modify my reservation instead of cancelling?</h3>
                <p className="text-gray-600">
                  Contact the host through our messaging system to request changes. Many hosts 
                  are flexible with date modifications if their calendar allows.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-2">What if the instrument isn't as described?</h3>
                <p className="text-gray-600">
                  If an instrument significantly differs from its listing description, contact 
                  us immediately. We may approve a full refund regardless of the cancellation policy.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Contact Support */}
      <Container>
        <div className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Need Help with a Cancellation?</h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Our support team is here to help with cancellation issues, 
              special circumstances, or any questions about our policies.
            </p>
            <a 
              href="/contact"
              className="inline-block px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CancellationPolicyPage;