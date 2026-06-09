type ApplicationsProps = {
  name: string;
  course: string;
  feeStatus: string;
};

const Applications = ({ name, course, feeStatus }: ApplicationsProps) => {
  return (
    <div className="application-row">
      <div>
        <p>{name}</p>
        <span>{course}</span>
      </div>

      <span className={`status-pill ${feeStatus === "Paid" ? "paid" : "pending"}`}>
        {feeStatus}
      </span>
    </div>
  );
};

export default Applications;
