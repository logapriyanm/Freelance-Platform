import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaBriefcase,
  FaUser,
  FaSearch,
  FaEnvelope,
  FaQuestionCircle,
  FaFileContract,
  FaShieldAlt,
  FaAward,
  FaHandshake,
} from "react-icons/fa";

const Footer = () => {
  const { user, token } = useSelector((state) => state.auth);
  const role = user?.role; // admin | freelancer | client | user

  // 🔴 Hide footer completely for admin
  if (role === "admin") return null;

  return (
    <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-10">

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">

          {/* ================= COLUMN 1 — COMPANY ================= */}
          <div>
            <div className="flex items-center mb-4">
              <FaBriefcase className="text-2xl mr-2 text-blue-300" />
              <h3 className="text-xl font-bold">FreelancePro</h3>
            </div>

            <p className="text-gray-300 text-sm mb-4">
              Connecting freelancers and clients worldwide with secure payments
              and trusted collaboration.
            </p>

            <div className="flex space-x-3 mb-4">
              <SocialIcon Icon={FaFacebook} />
              <SocialIcon Icon={FaTwitter} />
              <SocialIcon Icon={FaLinkedin} />
              <SocialIcon Icon={FaInstagram} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge icon={<FaShieldAlt />} text="Secure Payments" />
              <Badge icon={<FaAward />} text="Verified Talent" />
            </div>
          </div>

          {/* ================= COLUMN 2 — ROLE BASED ================= */}
          {!token && (
            <FooterSection title="Explore">
              <FooterLink to="/login">Login</FooterLink>
              <FooterLink to="/register">Register</FooterLink>
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
            </FooterSection>
          )}

          {token && role === "freelancer" && (
            <FooterSection title="For Freelancers" icon={<FaUser />}>
              <FooterLink to="/freelancer/projects" icon={<FaSearch />}>
                Find Projects
              </FooterLink>
              <FooterLink to="/freelancer/my-bids">My Bids</FooterLink>
              <FooterLink to="/freelancer/earnings">Earnings</FooterLink>
              <FooterLink to="/profile">My Profile</FooterLink>
            </FooterSection>
          )}

          {token && (role === "client" || role === "user") && (
            <FooterSection title="For Clients" icon={<FaBriefcase />}>
              <FooterLink to="/client/post-project">
                Post a Project
              </FooterLink>
              <FooterLink to="/projects">
                Browse Freelancers
              </FooterLink>
              <FooterLink to="/client/projects">
                My Projects
              </FooterLink>
              <FooterLink to="/client/payments">
                Payments
              </FooterLink>
            </FooterSection>
          )}

          {/* ================= COLUMN 3 — SPACER ================= */}
          <div className="hidden lg:block" />

          {/* ================= COLUMN 4 — SUPPORT ================= */}
          <FooterSection title="Support" icon={<FaHandshake />}>
            <FooterLink to="/help" icon={<FaQuestionCircle />}>
              Help Center
            </FooterLink>
            <FooterLink to="/contact" icon={<FaEnvelope />}>
              Contact Us
            </FooterLink>
            <FooterLink to="/terms" icon={<FaFileContract />}>
              Terms
            </FooterLink>
            <FooterLink to="/privacy">
              Privacy Policy
            </FooterLink>
          </FooterSection>
        </div>

        {/* ================= COPYRIGHT ================= */}
        <div className="border-t border-blue-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} FreelancePro. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

/* ================= HELPER COMPONENTS ================= */

const FooterSection = ({ title, icon, children }) => (
  <div>
    <h4 className="text-lg font-semibold mb-4 flex items-center">
      {icon && <span className="mr-2 text-blue-300">{icon}</span>}
      {title}
    </h4>
    <ul className="space-y-2">{children}</ul>
  </div>
);

const FooterLink = ({ to, icon, children }) => (
  <li>
    <Link
      to={to}
      className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ Icon }) => (
  <a
    href="#"
    className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-700 transition"
  >
    <Icon />
  </a>
);

const Badge = ({ icon, text }) => (
  <div className="flex items-center bg-blue-800/50 px-3 py-1 rounded text-xs">
    <span className="mr-2 text-green-400">{icon}</span>
    {text}
  </div>
);

export default Footer;
