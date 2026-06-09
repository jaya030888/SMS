import React from 'react'
import Course_Card from '../../components/Course_Card'

const Courses = () => {
  return (
    <section className="section courses-section" id="courses">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Popular trades</p>
          <h1>Our Courses</h1>
          <p>Choose a practical ITI course designed around employable technical skills.</p>
        </div>
        <div className="card-grid courses-grid">
          <Course_Card image="/file.svg" trade="Electrician" duration="2 years" para="Learn electrical installations, maintenance, and repair work." />
          <Course_Card image="/file.svg" trade="Fitter" duration="2 years" para="Master mechanical fitting, assembly, and maintenance skills." />
          <Course_Card image="/file.svg" trade="COPA" duration="1 year" para="Computer Operator and Programming Assistant training program." />
        </div>
      </div>
    </section>
  )
}

export default Courses
