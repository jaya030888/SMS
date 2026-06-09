import React from 'react'

const About = () => {
  return (
    <section className="section about-section" id="about">
      <div className="section-inner about-layout">
        <div>
          <p className="eyebrow">About the institute</p>
          <h1>Training students for skilled, confident work.</h1>
          <p>
            Maa Gauri Private ITI provides quality vocational 
            training and skill development to empower youth 
            with industry-ready expertise.
          </p>
        </div>
        <div className="about-stats">
          <div><strong>4+</strong><span>Core trade programs</span></div>
          <div><strong>12+</strong><span>Practical lab modules</span></div>
          <div><strong>1:1</strong><span>Student guidance</span></div>
        </div>
      </div>
    </section>
  )
}

export default About
