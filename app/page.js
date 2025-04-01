import React from "react";
import Link from "next/link";
import { FiShield, FiAward, FiCheckCircle, FiUser } from "react-icons/fi";
import { Toaster } from 'react-hot-toast';

const HomePage = () => {
  const features = [
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Tamper-Proof",
      description: "Certificates stored on blockchain cannot be altered or forged"
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Easy Verification",
      description: "Verify authenticity of any certificate in seconds"
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: "Instant Issuance",
      description: "Issue digital certificates with just a few clicks"
    },
    {
      icon: <FiUser className="w-8 h-8" />,
      title: "Decentralized",
      description: "No single point of failure or control"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <br />
      
      {/* Hero Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-blue-600">Blockchain</span> Certificate System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A decentralized platform for issuing and verifying tamper-proof certificates with complete transparency and security.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-all transform hover:scale-105">
              Get Started as Issuer
            </Link>
            <Link href="/verify-certificate" className="px-8 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-all">
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Our Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Transform Certification?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join institutions and organizations worldwide who are leveraging blockchain technology for secure credentialing.
          </p>
          <Link href="/register" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-all">
            Start Issuing Certificates Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;