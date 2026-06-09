import Image from "next/image"

type ContactCardProps = {
  image: string;
  alter: string;
  name: string;
  l1: string;
  l2: string;
}

const Contact_Card = (props: ContactCardProps) => {
  return (
    <div className="contact-card">
      <div className="contact-icon">
        <Image src = {props.image} alt={props.alter} height={20} width={20} />
      </div>

      <div>
        <h3>{props.name}</h3>
        <p>{props.l1}</p>
        <p>{props.l2}</p>
      </div>
    </div>
  )
}

export default Contact_Card
