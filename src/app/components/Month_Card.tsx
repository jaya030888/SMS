type MonthCardProps = {
  month: string;
  year: string;
};

type DayProps = {
  date: string;
  day: string;
  status: string;
};

const Month_Card = (props: MonthCardProps) => {
  const days = [
    ["1", "Wed", "P"],
    ["2", "Thu", "P"],
    ["3", "Fri", "P"],
    ["4", "Sat", "A"],
    ["6", "Mon", "P"],
    ["7", "Tue", "P"],
  ];

  return (
    <section className="panel attendance-log">
      <h2>
        {props.month} {props.year} Attendance Log
      </h2>
      <div className="day-grid">
        {days.map(([date, day, status]) => (
          <Days key={`${props.month}-${date}`} date={date} day={day} status={status} />
        ))}
      </div>
      <div className="legend">
        <span>
          <i className="present-dot" />
          Present
        </span>
        <span>
          <i className="absent-dot" />
          Absent
        </span>
      </div>
    </section>
  );
};

export default Month_Card;

function Days(props: DayProps) {
  return (
    <div className={`day-card ${props.status === "P" ? "is-present" : "is-absent"}`}>
      <strong>{props.date}</strong>
      <span>{props.day}</span>
      <b>{props.status}</b>
    </div>
  );
}
