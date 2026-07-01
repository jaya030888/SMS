import StuNav from "@/src/app/components/StuNav";

export default function Page() {
  return (
    <>
      <StuNav name="Attendance Management" role="admin" />
      <main className="dashboard-page">
        <section className="panel empty-state">
          <p className="eyebrow">Admin</p>
          <h1>Attendance Management</h1>
          <p>Attendance records and batch filters will appear here.</p>
        </section>
      </main>
    </>
  );
}
