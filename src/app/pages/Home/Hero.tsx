import React from 'react'
import Link from 'next/link'

const Hero = () => {
  return (
    <section className="hero section" id="home">
      <div className="section-inner hero-inner">
        <div className="hero-content">
          <p className="eyebrow">NCVT approved skill training</p>
          <h1>Building Future <span>Skilled Professionals</span></h1>

          <p>Maa Gauri Private ITI provides quality 
            vocational training and skill development 
            to empower youth with industry-ready expertise.
          </p>

          <div className="hero-actions">
            <Link href="/pages/Home/Addmission_Application_Form" className="button button-primary">
              Apply for Admissions
            </Link>

            <Link href="#courses" className="button button-secondary">
              Explore Trades
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="Institute highlights">
          <div className="hero-card">
            <div className="hero-card-top">
              <span>ITI</span>
              <strong>2026 Admissions</strong>
            </div>
            <h2>Technical trades for real careers</h2>
            <p>Practical labs, guided training, and placement support for every enrolled student.</p>

            <div className="hero-badges">
              <div>
                <strong>Govt.</strong>
                <span>Recognized</span>
              </div>
              <div>
                <strong>500+</strong>
                <span>Alumni</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Placement Help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
