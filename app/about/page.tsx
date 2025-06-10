import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Image from "next/image";
import Link from "next/link";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Connecting Musicians Through Instrument Sharing
            </h1>
            <p className="text-xl text-gray-700">
              Making quality musical instruments accessible to every musician, 
              from beginners to professionals.
            </p>
          </div>
        </Container>
      </div>

      {/* Our Story Section */}
      <Container>
        <div className="py-16">
          <div className="max-w-4xl mx-auto">
            <Heading
              title="Our Story"
              subtitle="Built by musicians, for musicians"
              center
            />
            <div className="mt-8 space-y-4 text-gray-600">
              <p>
                Resound was born from a simple observation: quality musical instruments 
                are expensive, and many sit unused in closets while aspiring musicians 
                struggle to access them.
              </p>
              <p>
                Founded in 2025, we set out to create a trusted marketplace where 
                instrument owners can share their treasured instruments with fellow 
                musicians, creating opportunities for both owners and renters.
              </p>
              <p>
                Whether you&apos;re a student needing a violin for lessons, a professional 
                seeking a specific instrument for a performance, or an owner looking to 
                share your collection, Resound connects you with the right people.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <Container>
          <Heading
            title="How Resound Works"
            subtitle="Renting an instrument is easy"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse & Book</h3>
              <p className="text-gray-600">
                Search for instruments in your area. Filter by type, condition, 
                and experience level. Book directly through our secure platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect & Collect</h3>
              <p className="text-gray-600">
                Message the owner to arrange pickup. Meet in person or choose 
                contactless pickup options. Start playing right away.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Play & Return</h3>
              <p className="text-gray-600">
                Enjoy the instrument for your rental period. When done, return 
                it to the owner. Leave a review to help the community.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Why Choose Resound */}
      <Container>
        <div className="py-16">
          <Heading
            title="Why Choose Resound"
            subtitle="Benefits for everyone in the music community"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4">For Renters</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Access professional-grade instruments without the high cost
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Try before you buy - test instruments before purchasing
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Perfect for students, performances, or recording sessions
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Secure payments and protection through our platform
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">For Owners</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Earn income from instruments you&apos;re not using
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Help fellow musicians in your community
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Set your own prices and availability
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  Insurance options available for peace of mind
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* Call to Action */}
      <div className="bg-amber-50 py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Browse Instruments
              </Link>
              <Link 
                href="/instruments"
                className="px-8 py-3 bg-white text-amber-600 border-2 border-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition"
              >
                List Your Instrument
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AboutPage;