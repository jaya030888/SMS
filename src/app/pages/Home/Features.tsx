import React from 'react'
import Features_Card from '../../components/Features_Card'

const Features = () => {
  return (
    <section className="section features-section">
      <div className="section-inner">
        <h1>Why Choose Us?</h1>
        <div className="card-grid features-grid">
          <Features_Card image="/file.svg" feature="Experienced Faculty" para="Learn from industry experts with years of practical experience"/>
          <Features_Card image="/file.svg" feature="Practical Training" para="Hands-on training with modern equipment and real-world projects"/>
          <Features_Card image="/file.svg" feature="NCVT Approved Trades" para="All our courses are approved by National Council for Vocational Training"/>
          <Features_Card image="/file.svg" feature="Industry Exposure" para="Industrial visits and placement assistance for better career prospects"/>
        </div>
      </div>
    </section>
  )
}

export default Features
