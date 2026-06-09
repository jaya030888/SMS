"use client"
import React from 'react'
import Image from 'next/image'

type FeaturesCardProps = {
  image: string;
  feature: string;
  para: string;
}

const Features_Card = (props: FeaturesCardProps) => {
  return (
    <article className="feature-card card">
      <Image
        src={props.image}
        alt={props.feature}
        width={100}
        height={100}
      />

      <h2>{props.feature}</h2>
      <p>{props.para}</p>
    </article>
  )
}

export default Features_Card
