import React, { useState, useEffect } from 'react';
import { FileText, Shield, Truck, ChevronDown, ArrowLeft } from 'lucide-react';

export default function PoliciesPage({ defaultTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'shipping', label: 'Shipping Policy', icon: Truck }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 sticky top-0 z-50" style={{ borderColor: '#12054b' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center bg-white border-[#12054b] space-x-2 mb-3 sm:mb-4 text-black hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={20} style={{ color: '#12054b' }} />
            <span className="text-sm sm:text-base font-medium" style={{ color: '#12054b' }}>Back to Home</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif" style={{ color: '#12054b' }}>
            NITAI GEMS
          </h1>
          <p className="text-black mt-1 sm:mt-2 text-sm sm:text-base">Legal Policies & Terms</p>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white sticky top-[88px] sm:top-[100px] z-40">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-6 py-4 bg-white mt-2 text-black font-medium`}
                style={activeTab === id ? {
                  backgroundColor: '#12054b',
                  borderBottomColor: '#12054b',
                  color: '#ffffff'
                } : {}}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden bg-white border-b sticky top-[72px] sm:top-[88px] z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors"
            style={{ 
              borderColor: '#12054b',
              backgroundColor: isDropdownOpen ? '#f9fafb' : 'white'
            }}
          >
            <div className="flex items-center space-x-3">
              {currentTab && <currentTab.icon size={20} style={{ color: '#12054b' }} />}
              <span className="font-medium text-black">{currentTab?.label}</span>
            </div>
            <ChevronDown 
              size={20} 
              style={{ color: '#12054b' }}
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 mx-4 bg-white border-2 rounded-lg shadow-lg overflow-hidden z-50"
                 style={{ borderColor: '#12054b' }}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`w-full flex items-center bg-white text-black space-x-3 px-4 py-3 `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {activeTab === 'terms' && <TermsContent />}
        {activeTab === 'privacy' && <PrivacyContent />}
        {activeTab === 'shipping' && <ShippingContent />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-black">
          <p className="font-medium text-base sm:text-lg" style={{ color: '#12054b' }}>NITAI GEMS</p>
          <p className="text-xs sm:text-sm mt-2">Nand Sadan, Gopaj ji ka Rasta, Johri Bazar, Jaipur</p>
          <p className="text-xs sm:text-sm mt-1">For grievances or queries, please contact us through our website</p>
        </div>
      </footer>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="prose max-w-none">
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6" style={{ borderLeft: '4px solid #12054b' }}>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4" style={{ color: '#12054b' }}>Terms & Conditions</h2>
        <p className="text-black text-xs sm:text-sm">
          Last Updated: As per Information Technology Act, 2000
        </p>
      </div>

      <Section title="Important Notice">
        <p className="text-sm sm:text-base">This document is an electronic record under the Information Technology Act, 2000 and does not require physical or digital signatures. By accessing, browsing, or using the Platform (nitaigems.com), you agree to all terms and conditions outlined here.</p>
      </Section>

      <Section title="About This Agreement">
        <p className="text-sm sm:text-base">The Platform is owned by <strong>NITAI GEMS</strong>, a company incorporated under the Companies Act, 1956, with its registered office at Nand Sadan, Gopaj ji ka Rasta, Johri Bazar, Jaipur.</p>
        <p className="mt-3 text-sm sm:text-base">These Terms of Use govern your access to our website, services, and tools. Any additional terms proposed by you that conflict with these Terms are expressly rejected.</p>
      </Section>

      <Section title="Key Terms of Use">
        <div className="space-y-3 sm:space-y-4">
          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">1. Account Registration</h4>
            <p className="text-sm sm:text-base">You agree to provide true, accurate, and complete information during registration and shall be responsible for all activities through your account.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">2. No Warranties</h4>
            <p className="text-sm sm:text-base">Neither we nor third parties provide warranty regarding accuracy, timeliness, or completeness of information on the Platform. You acknowledge materials may contain errors.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">3. Use at Your Own Risk</h4>
            <p className="text-sm sm:text-base">Your use of our Services and Platform is at your own risk. You must independently assess that the Services meet your requirements.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">4. Intellectual Property</h4>
            <p className="text-sm sm:text-base">Platform contents are proprietary and licensed to us. You have no authority to claim intellectual property rights over design, layout, graphics, or other content.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">5. Lawful Use Only</h4>
            <p className="text-sm sm:text-base">You agree not to use the Platform for any unlawful, illegal, or forbidden purpose under these Terms or applicable Indian laws.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">6. Payment of Charges</h4>
            <p className="text-sm sm:text-base">You agree to pay all charges associated with availing the Services.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">7. Third-Party Links</h4>
            <p className="text-sm sm:text-base">The Platform may contain links to third-party websites. You will be governed by their respective terms and policies when accessing those links.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">8. Binding Contract</h4>
            <p className="text-sm sm:text-base">Upon initiating a transaction, you enter into a legally binding contract with NITAI GEMS for the Services.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">9. Indemnification</h4>
            <p className="text-sm sm:text-base">You shall indemnify and hold harmless NITAI GEMS, its affiliates, officers, directors, and employees from any claims, demands, or actions arising from your breach of these Terms.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">10. Force Majeure</h4>
            <p className="text-sm sm:text-base">Neither party shall be liable for failure to perform obligations if prevented by force majeure events.</p>
          </div>
        </div>
      </Section>

      <Section title="Refund and Cancellation Policy">
        <div className="space-y-3 sm:space-y-4">
          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">1. Cancellation Period</h4>
            <p className="text-sm sm:text-base">Cancellations will only be considered if the request is made within 21 days of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to sellers/merchants listed on the Platform and they have initiated the process of shipping them, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">2. Perishable Items</h4>
            <p className="text-sm sm:text-base">NITAI GEMS does not accept cancellation requests for perishable items like flowers, eatables, etc. However, refund/replacement can be made if the user establishes that the quality of the product delivered is not good.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">3. Damaged or Defective Items</h4>
            <p className="text-sm sm:text-base">In case of receipt of damaged or defective items, please report to our customer service team. The request would be entertained once the seller/merchant listed on the Platform has checked and determined the same at its own end. This should be reported within 21 days of receipt of products.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">4. Product Not as Expected</h4>
            <p className="text-sm sm:text-base">In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 21 days of receiving the product. The customer service team after looking into your complaint will take an appropriate decision.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">5. Warranty Products</h4>
            <p className="text-sm sm:text-base">In case of complaints regarding the products that come with a warranty from the manufacturers, please refer the issue to them.</p>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2" style={{ borderColor: '#12054b' }}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">6. Refund Processing</h4>
            <p className="text-sm sm:text-base">In case of any refunds approved by NITAI GEMS, it will take 21 days for the refund to be processed to you.</p>
          </div>
        </div>
      </Section>

      <Section title="Return Policy">
        <p className="text-sm sm:text-base">We offer refund/exchange within first 21 days from the date of your purchase. If 21 days have passed since your purchase, you will not be offered a return, exchange or refund of any kind.</p>
        <p className="mt-3 text-sm sm:text-base">In order to become eligible for a return or an exchange:</p>
        <ul className="list-disc pl-5 sm:pl-6 mt-3 space-y-2">
          <li className="text-sm sm:text-base">The purchased item should be unused and in the same condition as you received it</li>
          <li className="text-sm sm:text-base">The item must have original packaging</li>
          <li className="text-sm sm:text-base">If the item that you purchased on a sale, then the item may not be eligible for a return/exchange</li>
        </ul>
        <p className="mt-3 text-sm sm:text-base">Further, only such items are replaced by us (based on an exchange request), if such items are found defective or damaged.</p>
        <p className="mt-3 text-sm sm:text-base">You agree that there may be a certain category of products/items that are exempted from returns or refunds. Such categories of the products would be identified to you at the item of purchase.</p>
        <p className="mt-3 text-sm sm:text-base">For exchange/return accepted request(s) (as applicable), once your returned product/item is received and inspected by us, we will send you an email to notify you about receipt of the returned/exchanged product. Further, if the same has been approved after the quality check at our end, your request (i.e. return/exchange) will be processed in accordance with our policies.</p>
      </Section>

      <Section title="Governing Law & Jurisdiction">
        <p className="text-sm sm:text-base">These Terms shall be governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of courts in <strong>Jaipur and Rajasthan</strong>.</p>
      </Section>

      <Section title="Modifications">
        <p className="text-sm sm:text-base">These Terms can be modified at any time without prior notice. It is your responsibility to periodically review these Terms to stay informed of updates.</p>
      </Section>

      <Section title="Contact Us">
        <p className="text-sm sm:text-base">All concerns or communications relating to these Terms must be communicated using the contact information provided on our website.</p>
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="prose max-w-none">
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6" style={{ borderLeft: '4px solid #12054b' }}>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4" style={{ color: '#12054b' }}>Privacy Policy</h2>
        <p className="text-black text-xs sm:text-sm">
          Your privacy is important to us
        </p>
      </div>

      <Section title="Introduction">
        <p className="text-sm sm:text-base">This Privacy Policy describes how NITAI GEMS and its affiliates collect, use, share, protect or otherwise process your personal data through nitaigems.com. We do not offer products or services outside India, and your personal data will primarily be stored and processed in India.</p>
        <p className="mt-3 text-sm sm:text-base">By visiting this Platform or availing any service, you expressly agree to be bound by this Privacy Policy, Terms of Use, and applicable laws of India including data protection and privacy laws.</p>
      </Section>

      <Section title="Information Collection">
        <p className="text-sm sm:text-base">We collect your personal data when you use our Platform or interact with us. Information collected may include:</p>
        <ul className="list-disc pl-5 sm:pl-6 mt-3 space-y-2">
          <li className="text-sm sm:text-base">Personal information: name, date of birth, address, telephone/mobile number, email ID</li>
          <li className="text-sm sm:text-base">Identity or address proof documents</li>
          <li className="text-sm sm:text-base">Payment information: bank account, credit/debit card details</li>
          <li className="text-sm sm:text-base">Biometric information: facial features or physiological data (when you opt for certain features)</li>
          <li className="text-sm sm:text-base">Behavioral data: preferences and transaction information</li>
        </ul>
        <p className="mt-3 text-sm sm:text-base">You always have the option not to provide information by choosing not to use a particular service or feature. Information is collected in accordance with applicable laws.</p>
        <div className="mt-3 p-3 sm:p-4 bg-red-50 rounded-lg border-l-4" style={{ borderColor: '#12054b' }}>
          <p className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#12054b' }}>
            Important Security Notice:
          </p>
          <p className="text-xs sm:text-sm">
            If you receive an email or call from a person/association claiming to be NITAI GEMS seeking any personal data like debit/credit card PIN, net-banking or mobile banking password, we request you to never provide such information. If you have already revealed such information, report it immediately to an appropriate law enforcement agency.
          </p>
        </div>
      </Section>

      <Section title="How We Use Your Information">
        <p className="text-sm sm:text-base">We use your personal data to:</p>
        <ul className="list-disc pl-5 sm:pl-6 mt-3 space-y-2">
          <li className="text-sm sm:text-base">Provide requested services and fulfill orders</li>
          <li className="text-sm sm:text-base">Enhance customer experience and customize your experience</li>
          <li className="text-sm sm:text-base">Resolve disputes and troubleshoot problems</li>
          <li className="text-sm sm:text-base">Inform you about offers, products, services, and updates</li>
          <li className="text-sm sm:text-base">Detect and protect against fraud and other criminal activity</li>
          <li className="text-sm sm:text-base">Enforce our terms and conditions</li>
          <li className="text-sm sm:text-base">Conduct marketing research, analysis, and surveys</li>
        </ul>
        <p className="mt-3 text-sm sm:text-base">We provide the ability to opt-out of marketing uses of your personal data. You understand that your access to these products/services may be affected in the event permission is not provided to us.</p>
      </Section>

      <Section title="Information Sharing">
        <p className="text-sm sm:text-base">We may share your personal data with:</p>
        <ul className="list-disc pl-5 sm:pl-6 mt-3 space-y-2">
          <li className="text-sm sm:text-base">Our group entities, corporate entities, and affiliates to provide services</li>
          <li className="text-sm sm:text-base">Third parties such as sellers, business partners, logistics partners, prepaid payment instrument issuers, third-party reward programs and other payment options</li>
          <li className="text-sm sm:text-base">Government agencies or law enforcement if required by law or in good faith belief</li>
          <li className="text-sm sm:text-base">Third party rights owners when necessary to protect rights, property or personal safety</li>
        </ul>
        <p className="mt-3 text-sm sm:text-base">Entities we share data with may market to you unless you explicitly opt-out. We may disclose data to comply with legal obligations, prevent fraud, and enforce our policies.</p>
      </Section>

      <Section title="Security Measures">
        <p className="text-sm sm:text-base">We adopt reasonable security practices and procedures to protect your personal data from unauthorized access, disclosure, loss, or misuse. When you access your account, we adhere to security guidelines and offer secure server usage.</p>
        <p className="mt-3 text-sm sm:text-base">However, the transmission of information is not completely secure for reasons beyond our control. By using the Platform, you accept the security implications of data transmission over the internet which cannot always be guaranteed as completely secure.</p>
        <p className="mt-3 text-sm sm:text-base">Users are responsible for protecting their login credentials and password records for their account.</p>
      </Section>

      <Section title="Data Deletion and Retention">
        <p className="text-sm sm:text-base">You can delete your account by visiting your profile and settings, which will result in losing all information related to your account. You may also contact us for assistance with deletion requests.</p>
        <p className="mt-3 text-sm sm:text-base">We may refuse or delay account deletion if there are pending grievances, claims, pending shipments or any other services. Once deleted, you lose access to the account.</p>
        <p className="mt-3 text-sm sm:text-base">We retain personal data only as long as required for the purpose collected or as required under applicable law. However, we may retain data if we believe it may be necessary to prevent fraud or future abuse or for other legitimate purposes.</p>
        <p className="mt-3 text-sm sm:text-base">We may continue to retain your data in anonymised form for analytical and research purposes.</p>
      </Section>

      <Section title="Your Rights">
        <p className="text-sm sm:text-base">You may access, rectify, and update your personal data directly through the functionalities provided on the Platform.</p>
      </Section>

      <Section title="Your Consent">
        <p className="text-sm sm:text-base">By visiting our Platform or providing information, you consent to the collection, use, storage, disclosure, and processing of your information in accordance with this Privacy Policy. If you disclose to us any personal data relating to other people, you represent that you have the authority to do so and permit us to use the information in accordance with this Privacy Policy.</p>
        <p className="mt-3 text-sm sm:text-base">You consent to us (including our other corporate entities, affiliates, lending partners, technology partners, marketing channels, business partners and other third parties) contacting you through SMS, instant messaging apps, calls, and email for purposes specified in this Policy.</p>
        <p className="mt-3 text-sm sm:text-base">You may withdraw consent by contacting our Grievance Officer with "Withdrawal of consent for processing personal data" in the subject line. We may verify such requests before acting on them.</p>
        <p className="mt-3 text-sm sm:text-base">Note that withdrawal of consent will not be retrospective and will be in accordance with the Terms of Use, this Privacy Policy, and applicable laws. We reserve the right to restrict or deny services if we consider the information necessary.</p>
      </Section>

      <Section title="Policy Changes">
        <p className="text-sm sm:text-base">Please check our Privacy Policy periodically for changes. We may update this Policy to reflect changes to our information practices and will notify you of significant changes as required by law.</p>
      </Section>

      <Section title="Contact Information">
        <p className="text-sm sm:text-base">For grievances or queries, please contact our Grievance Officer using the contact information provided on our website.</p>
        <p className="mt-2 text-sm sm:text-base"><strong>Phone Hours:</strong> Monday - Friday (9:00 AM - 6:00 PM)</p>
      </Section>
    </div>
  );
}

function ShippingContent() {
  return (
    <div className="prose max-w-none">
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6" style={{ borderLeft: '4px solid #12054b' }}>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4" style={{ color: '#12054b' }}>Shipping Policy</h2>
        <p className="text-black text-xs sm:text-sm">
          Information about order delivery and shipping
        </p>
      </div>

      <Section title="Shipping Method">
        <p className="text-sm sm:text-base">Orders are shipped through registered domestic courier companies and/or speed post only. We partner with reliable courier services to ensure safe delivery of your orders.</p>
      </Section>

      <Section title="Shipping Timeline">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mt-3">
          <p className="font-semibold text-sm sm:text-base" style={{ color: '#12054b' }}>Standard Shipping: 15 Days</p>
          <p className="mt-2 text-xs sm:text-sm">Orders are shipped within <strong>15 days</strong> from the date of order and/or payment, or as per the delivery date agreed at the time of order confirmation.</p>
        </div>
        <p className="mt-3 text-sm sm:text-base">Delivery timeline is subject to courier company and post office norms. Actual delivery times may vary based on your location and courier service availability.</p>
      </Section>

      <Section title="Delivery Address">
        <p className="text-sm sm:text-base">Delivery of all orders will be made to the address provided by the buyer at the time of purchase. Please ensure your delivery address is complete and accurate to avoid delays.</p>
        <p className="mt-3 text-sm sm:text-base">Delivery confirmation for services will be sent to your registered email ID as specified during registration.</p>
      </Section>

      <Section title="Shipping Costs">
        <p className="text-sm sm:text-base">If there are any shipping costs levied by the seller or Platform Owner, these charges are <strong>non-refundable</strong>.</p>
      </Section>

      <Section title="Limitation of Liability">
        <p className="text-sm sm:text-base">NITAI GEMS (Platform Owner) shall not be liable for any delay in delivery caused by the courier company or postal authority. We make every effort to ensure timely dispatch, but delivery times are ultimately dependent on third-party services.</p>
      </Section>

      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mt-6" style={{ borderLeft: '4px solid #12054b' }}>
        <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: '#12054b' }}>Need Help?</h3>
        <p className="text-xs sm:text-sm">For shipping-related queries or concerns, please contact us using the information provided on our website during business hours (Monday - Friday, 9:00 AM - 6:00 PM).</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: '#12054b' }}>{title}</h3>
      <div className="text-black leading-relaxed">
        {children}
      </div>
    </div>
  );
}