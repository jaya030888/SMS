import Login_Card from "../../components/Chose_Login_Card";
import Image from "next/image";

const Page = () => {
  return (
    <main className="auth-page">
      <section className="auth-shell card">
        <Image src="/file.svg" alt="Login" height={48} width={48} />

        <h1>Choose your login type</h1>
        <p>Continue to the workspace that matches your role.</p>

        <div className="login-options-grid">
          <Login_Card
            image="/file.svg"
            alter="Student"
            role="Student"
            para="Access your dashboard, course details, attendance, and fee status."
            to="/pages/Login_Page/Student_Login"
          />

          <Login_Card
            image="/file.svg"
            alter="Admin"
            role="Admin"
            para="Manage students, admissions, attendance, and fee records."
            to="/pages/Login_Page/Admin_Login"
          />
        </div>
      </section>
    </main>
  );
};

export default Page;
