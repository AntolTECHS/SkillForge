import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HomeNavbar from "../components/HomeNavbar";

const Home = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    if (!document.getElementById("gf-poppins")) {
      const link = document.createElement("link");
      link.id = "gf-poppins";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      q: "What is SkillForge?",
      a: "SkillForge is a modern online learning platform powered by intelligent tools and hands-on learning experiences.",
    },
    {
      q: "Is SkillForge free to start?",
      a: "Yes! You can create an account for free and access selected beginner-friendly lessons.",
    },
    {
      q: "Does SkillForge use AI?",
      a: "Yes. SkillForge provides AI-assisted explanations, guided study help, and personalized learning suggestions.",
    },
    {
      q: "Do I receive certificates?",
      a: "Yes! After completing course modules and projects, you earn a verified SkillForge certificate.",
    },
  ];

  return (
    <div className="bg-white font-[Poppins]">
      <HomeNavbar />

      {/* HERO SECTION */}
      <section className="px-6 lg:px-40 py-20 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            AI-Enhanced Learning
            <span className="text-sky-600 block">Built for the Next Generation</span>
          </h1>

          <p className="text-gray-600 mt-6 text-lg max-w-xl">
            Build real-world skills with guided lessons, adaptive explanations, and engaging course content.
          </p>

          <div className="flex gap-4 mt-8 flex-nowrap">
            <Link
              to="/login"
              className="bg-sky-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:bg-sky-700 transition whitespace-nowrap"
            >
              Get Started →
            </Link>

            <Link
              to="/register"
              className="border border-gray-400 px-6 py-2 sm:px-8 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
            >
              Explore Courses
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 w-full flex justify-center"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-full lg:max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              src="https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg"
              alt="student studying"
              className="w-full h-auto object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-20 px-6 lg:px-40">
        <motion.h2
          className="text-3xl lg:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Why SkillForge?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "AI-Guided Learning",
              text: "Receive personalized feedback and adaptive study support.",
            },
            {
              title: "Hands-On Projects",
              text: "Work through real-world projects to reinforce understanding.",
            },
            {
              title: "Engaging Gamification",
              text: "Earn XP, badges, and level up as you learn.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-8 bg-white shadow-md rounded-xl hover:shadow-lg transition"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 lg:px-40">
        <motion.h2
          className="text-3xl lg:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((item, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 rounded-xl p-5 cursor-pointer"
              onClick={() => toggleFAQ(index)}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{item.q}</h3>
                <span className="text-xl">{openFAQ === index ? "−" : "+"}</span>
              </div>

              {openFAQ === index && (
                <motion.p
                  className="mt-3 text-gray-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.a}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-sky-600 py-20 px-6 lg:px-40 text-center rounded-xl mx-6 lg:mx-40 mb-10 shadow-lg">
        <motion.h2
          className="text-3xl lg:text-4xl font-extrabold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Ready to Start Your Learning Journey?
        </motion.h2>
        <motion.p
          className="text-white text-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join other students learning on SkillForge and unlock your potential today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            to="/register"
            className="bg-white text-sky-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition"
          >
            Join Now
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10 px-6 lg:px-40 mt-0 font-[Poppins]">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-gray-300">
            © {new Date().getFullYear()} SkillForge — Empowering Modern Learning.
          </p>

          <div className="flex gap-6 text-gray-300">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
