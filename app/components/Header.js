"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { FiHome, FiUserPlus, FiCheckCircle, FiFileText, FiExternalLink } from "react-icons/fi";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: <FiHome className="" /> },
    { href: "/register", label: "Register Issuer", icon: <FiUserPlus className="" /> },
    { href: "/issue-certificate", label: "Issue Certificate", icon: <FiUserPlus className="" /> },
    { href: "/verify-certificate", label: "Verify Certificate", icon: <FiCheckCircle className="" /> },
    { href: "/view-certificates", label: "View Certificates", icon: <FiFileText className="" /> },
    { href: "/approve-issuers", label: "Approve Issuers", icon: <FiCheckCircle className="" /> },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3">
              <Image
                           src="/logo.png"
                           alt="Blockchain Certificates"
                           width={40}
                           height={40}
                           className="rounded-lg"
                         />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent sm:block">
              CertChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-blue-50 relative group ${pathname === link.href
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
                  }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 rounded-md focus:outline-none hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${pathname === link.href
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};