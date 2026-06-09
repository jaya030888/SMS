type InfoSameLinerProps = {
  label: string;
  entry: string;
  entryColor?: string;
  className?: string;
};

const Info_sameliner = (props: InfoSameLinerProps) => {
  return (
    <div className={props.className ?? "same-line"}>
      <p>{props.label}</p>
      <p style={{ color: props.entryColor }}>{props.entry}</p>
    </div>
  );
};

export default Info_sameliner;
