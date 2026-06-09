import React from 'react'
import Image from 'next/image'

type UpdatesCardProps = {
  date: string;
  update: string;
  para: string;
}

const Updates_Card = (props: UpdatesCardProps) => {
  return (
    <article className="update-card card">

    <div className="update-meta">
        <Image src="/file.svg" alt="" width={18} height={18} />
        <span>{props.date}</span>
    </div>

    <h3>
        {props.update}
    </h3>

    <p>{props.para}</p>

    </article>

  )
}

export default Updates_Card
