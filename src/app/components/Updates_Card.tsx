import React from 'react'
import { Calendar } from 'lucide-react'

type UpdatesCardProps = {
  date: string;
  update: string;
  para: string;
}

const Updates_Card = (props: UpdatesCardProps) => {
  return (
    <article className="update-card card">
      <div className="update-meta">
        <Calendar className="text-primary opacity-80" size={18} />
        <span>{props.date}</span>
      </div>

      <h3>{props.update}</h3>
      <p>{props.para}</p>
    </article>
  )
}

export default Updates_Card
