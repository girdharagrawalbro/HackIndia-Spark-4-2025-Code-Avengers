import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from "react-hot-toast";
import MotionWrapper from './components/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Blockchain Certification System",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MotionWrapper>
        <ErrorBoundary>
          <Header />
          <section className="main flex flex-col items-center">
                    <br />
                    <br />
            
            {children}
          </section>
          <Toaster
            position="top-center"
            reverseOrder={false}
          />
          <Footer />
          </ErrorBoundary>
        </MotionWrapper>
      </body>
    </html>
  );
}
