import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h2>Contact Information</h2>

          <div className="footer-item">
            <Image src="/file.svg" alt="Phone icon" width={18} height={18} />
            <span>+91 98765 43210</span>
          </div>

          <div className="footer-item">
            <Image src="/file.svg" alt="Email icon" width={18} height={18} />
            <span>info@itiinstitute.edu</span>
          </div>

          <div className="footer-item">
            <Image src="/file.svg" alt="Address icon" width={18} height={18} />
            <span>123 Education Street, City, State</span>
          </div>
        </div>

        <div>
          <h2>Quick Links</h2>

          <p><Link href="/#about">About Us</Link></p>
          <p><Link href="/#courses">Courses</Link></p>
          <p><Link href="/pages/Home/Addmission_Application_Form">Admissions</Link></p>
          <p><Link href="/#contact">Contact</Link></p>
        </div>

        <div>
          <h2>Office Hours</h2>

          <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
          <p>Saturday: 9:00 AM - 1:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      </div>

      <p className="copyright">Copyright 2026 ITI Institute. All rights reserved.</p>
    </footer>
  )
}

export default Footer
