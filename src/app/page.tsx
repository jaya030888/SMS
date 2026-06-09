import { Navbar } from "./pages/Home/Navbar";
import Hero from "./pages/Home/Hero";
import About from "./pages/Home/About";
import Features from "./pages/Home/Features";
import Courses from "./pages/Home/Courses";
import Updates from "./pages/Home/Updates";
import Gallery from "./pages/Home/Gallery";
import Contact from "./pages/Home/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <Courses />
        <Updates />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
