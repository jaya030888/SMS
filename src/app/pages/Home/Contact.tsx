import React from 'react'
import Contact_Card from '../../components/Contact_Card'


const Contact = () => {
  return (
    <section className="section contact-section" id="contact">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Reach us</p>
          <h1>Contact Us</h1>
          <p>Talk to the admission office for course details, eligibility, and visits.</p>
        </div>

        <div className="contact-layout">
          <div className="contact-panel">
            <h2>Get In Touch</h2>

            <div className="contact-list">
              <Contact_Card image="/file.svg" alter="Address icon" name="Address" l1="123 Education Street, Industrial Area" l2="City, State - 123456" />
              <Contact_Card image="/file.svg" alter="Phone icon" name="Phone" l1="+91 98765 43210" l2="+91 98765 43389" />
              <Contact_Card image="/file.svg" alter="Email icon" name="Email" l1="info@itiinstitute.edu" l2="admissions@itiinstitute.edu" />
              <Contact_Card image="/file.svg" alter="Clock icon" name="Office Hours" l1="Monday - Friday: 9:00 AM - 5:00 PM" l2="Saturday: 9:00 AM - 1:00 PM" />
            </div>
          </div>

          <div className="map-panel">Map</div>
        </div>
      </div>
    </section>
  )
}

export default Contact
