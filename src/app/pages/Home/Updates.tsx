import React from 'react'
import Image from 'next/image'

import Updates_Card from '../../components/Updates_Card'

const Updates = () => {
  return (
    <section className="section updates-section" id="updates">
      <div className="section-inner">
        <div className="section-title-row">
          <Image src="/file.svg" alt="" width={24} height={24} />
          <h1>Notices & Updates</h1>
        </div>

        <div className="updates-list">
          <Updates_Card date="Jan 25, 2026" update="Admission Open for 2026-27 Batch" para ="Applications are now being accepted for all ITI courses. Apply before Feb 28, 2026." />
          <Updates_Card date="Jan 20, 2026" update="Workshop on Modern Electrical Systems" para ="Special workshop scheduled for Electrician students on January 30, 2026." />
          <Updates_Card date="Jan 15, 2026" update="Industrial Visit to Manufacturing Unit" para ="Fitter trade students will visit local manufacturing facility on February 5, 2026." />
        </div>
      </div>
    </section>
  )
}

export default Updates
