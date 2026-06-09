import React from 'react'
import Image from 'next/image'

type GalleryCardProps = {
  image: string;
  alter: string;
  text: string;
}

const Gallery_card = (props: GalleryCardProps) => {
  return (
    <article className="gallery-card card">
      <Image src={props.image} alt={props.alter} width={48} height={48} />
        <span>
               {props.text}
        </span>
      
    </article>
  )
}

export default Gallery_card
