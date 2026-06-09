import Image from "next/image"
import Link from "next/link"

type ChoseLoginCardProps = {
  image: string;
  alter: string;
  role: string;
  para: string;
  to: string;
}

const Login_Card = (props: ChoseLoginCardProps) => {
  return (
    <article className="login-option-card card">
      <Image src={props.image} alt={props.alter} height={42} width={42} />

      <h2>{props.role} Login</h2>
      <p>{props.para}</p>

      <Link className="button button-primary" href={props.to}>
        Login as {props.role}
      </Link>
    </article>
  )
}

export default Login_Card
