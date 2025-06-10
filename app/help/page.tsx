"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { useState } from "react";
import { BiSearch, BiChevronDown, BiChevronUp } from "react-icons/bi";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "getting-started", "rentals", "payments", "safety", "account"];

  const faqs: FAQItem[] = [
    // Getting Started
    {
      category: "getting-started",
      question: "How do I create an account?",
      answer: "Click the menu icon in the top right corner and select 'Sign up'. You can register with your email address or sign in with Google. We'll send a verification email to confirm your account."
    },
    {
      category: "getting-started",
      question: "Is Resound available in my area?",
      answer: "Resound is available throughout the United States. You can search for instruments by city, state, or ZIP code. If there aren't many listings in your area yet, consider being one of the first to list your instruments!"
    },
    {
      category: "getting-started",
      question: "What types of instruments can I rent?",
      answer: "We support a wide range of instruments including guitars, pianos, violins, cellos, drums, woodwinds, brass instruments, and more. Each listing includes details about the instrument's condition and the experience level it's suitable for."
    },
    
    // Rentals
    {
      category: "rentals",
      question: "How long can I rent an instrument?",
      answer: "Rental periods are flexible and set by the instrument owner. Most rentals range from a few days to several months. Check each listing's calendar for availability and minimum rental periods."
    },
    {
      category: "rentals",
      question: "Can I extend my rental?",
      answer: "Yes, if the instrument is available for your extended dates. Contact the owner through our messaging system to arrange an extension. You'll need to pay for the additional days."
    },
    {
      category: "rentals",
      question: "What if I need to cancel my rental?",
      answer: "You can cancel your rental from your Rentals page. Cancellation policies vary by owner and how far in advance you cancel. Check the specific listing's cancellation policy before booking."
    },
    {
      category: "rentals",
      question: "How do I arrange pickup and return?",
      answer: "After booking, use our messaging system to coordinate with the owner. They'll provide the pickup location and any special instructions. Many owners offer flexible pickup times and some provide contactless options."
    },
    
    // Payments
    {
      category: "payments",
      question: "How do payments work?",
      answer: "All payments are processed securely through Stripe. When you book an instrument, you'll pay the full rental amount upfront. Owners receive payment after successful pickup."
    },
    {
      category: "payments",
      question: "What payment methods are accepted?",
      answer: "We accept all major credit and debit cards through Stripe. Payment information is encrypted and never stored on our servers."
    },
    {
      category: "payments",
      question: "When do owners get paid?",
      answer: "Owners receive payment after the renter confirms pickup of the instrument. Payments are typically processed within 2-3 business days through Stripe."
    },
    {
      category: "payments",
      question: "Are there any additional fees?",
      answer: "Resound charges a small service fee to renters to cover payment processing and platform maintenance. The total amount including fees is shown before you complete your booking."
    },
    
    // Safety
    {
      category: "safety",
      question: "How does Resound ensure safety?",
      answer: "We verify all users through email confirmation, maintain secure messaging within the platform, and encourage users to meet in safe, public locations. All users can build trust through reviews and rental history."
    },
    {
      category: "safety",
      question: "What if an instrument is damaged?",
      answer: "We recommend owners and renters discuss instrument care and any existing damage before the rental. For valuable instruments, owners may want to consider insurance. Document the instrument's condition at pickup and return."
    },
    {
      category: "safety",
      question: "How do I report a problem?",
      answer: "If you experience any issues with a rental or another user, please report it immediately through our 'Report an issue' page. We take all reports seriously and will investigate promptly."
    },
    
    // Account
    {
      category: "account",
      question: "How do I update my profile?",
      answer: "Click on your avatar in the top right corner and select 'My profile' from the dropdown menu. Here you can update your name, photo, and other account details."
    },
    {
      category: "account",
      question: "How do I become a verified owner?",
      answer: "Build your reputation by completing successful rentals, maintaining good communication, and earning positive reviews. Consistent quality service will establish you as a trusted member of the community."
    },
    {
      category: "account",
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account by contacting us through the Contact page. Please note that this action is permanent and will remove all your listings, bookings, and rental history."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-amber-50 py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Help Center
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Find answers to common questions about Resound
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <BiSearch className="absolute left-4 top-4 text-gray-400 text-xl" />
            </div>
          </div>
        </Container>
      </div>

      {/* Categories */}
      <Container>
        <div className="py-8 border-b">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? "All Topics" : cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* FAQ Section */}
      <Container>
        <div className="py-16">
          <div className="max-w-3xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No results found. Try a different search term.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                    >
                      <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                      {openItems.includes(index) ? (
                        <BiChevronUp className="text-xl text-gray-500 flex-shrink-0" />
                      ) : (
                        <BiChevronDown className="text-xl text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {openItems.includes(index) && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Still Need Help */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Still need help?</h2>
            <p className="text-gray-700 mb-8">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Contact Support
              </Link>
              <Link 
                href="/safety"
                className="px-8 py-3 bg-white text-amber-600 border-2 border-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition"
              >
                Safety Resources
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default HelpPage;