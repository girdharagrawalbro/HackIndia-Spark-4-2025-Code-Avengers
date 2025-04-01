import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiUserPlus, FiCheckCircle, FiFileText, FiExternalLink } from 'react-icons/fi';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    { name: 'GitHub', url: 'https://github.com', icon: <FiExternalLink /> },
    { name: 'Twitter', url: 'https://twitter.com', icon: <FiExternalLink /> },
    { name: 'Discord', url: 'https://discord.com', icon: <FiExternalLink /> },
  ];

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Blockchain Certificates"
                width={40}
                height={40}
                className="rounded-lg"
              />
              {/* <Image src="./logo.png" className="" width="40px" height="40px" /> */}
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                CertChain
              </span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              Decentralized certificate verification system
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              © {currentYear} Blockchain Certificates. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Developed by Team <strong className="text-blue-300">Code Avengers</strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer