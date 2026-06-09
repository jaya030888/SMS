import React from 'react'
import { Cog, Monitor, Zap } from 'lucide-react'

type CourseCardProps = {
  image: string;
  trade: string;
  duration: string;
  para: string;
}

const Course_Card = (props: CourseCardProps) => {
  const tradeName = props.trade.toLowerCase();
  const Icon = tradeName.includes("electrician") ? Zap : tradeName.includes("fitter") ? Cog : Monitor;

  return (
    <article className="course-card card">
        <span className="course-icon" aria-hidden="true">
          <Icon size={32} strokeWidth={2.2} />
        </span>

        <h3>{props.trade}</h3>

        <p>Duration: {props.duration}</p>

        <p>{props.para}</p>
    </article>
  )
}

export default Course_Card
