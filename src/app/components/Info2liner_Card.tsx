type Info2LinerCardProps = {
  label: string;
  entry: string;
  className?: string;
};

const Info2liner_Card = (props: Info2LinerCardProps) => {
  return (
    <div className={props.className ?? "metric-card"}>
      <p>{props.label}</p>
      <p>{props.entry}</p>
    </div>
  );
};

export default Info2liner_Card;
