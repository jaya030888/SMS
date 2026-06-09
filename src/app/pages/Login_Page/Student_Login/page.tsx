import Login_Card from '@/src/app/components/Login_Card'

const page = () => {
  return (
    <Login_Card
      image="/file.svg"
      alter="Student login icon"
      role="Student"
      para="Access your student dashboard"
      label="Student ID"
      type="number"
      placeholder="Enter your Student ID"
      dashboardPath="/pages/Student/DashBoard"
    />
  )
}

export default page
