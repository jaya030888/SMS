import Info_Card from "@/src/app/components/Info_Card";
import Info_sameliner from "@/src/app/components/Info_sameliner";
import StuNav from "@/src/app/components/StuNav";
import { Download } from "lucide-react";

const Page = () => {
  return (
    <>
      <StuNav name="Fee Details" />

      <main className="dashboard-page">
        <Info_Card
          className="info-card success-card"
          image="/file.svg"
          alter=""
          feild="Fee Payment Complete"
          entry="Your fees have been paid in full. Thank you!"
        />

        <section className="dashboard-grid two">
          <div className="panel">
            <h2>Fee Breakdown</h2>
            <Info_sameliner label="Tuition Fee" entry="Rs. 10,000" />
            <Info_sameliner label="Lab Fee" entry="Rs. 2,000" />
            <Info_sameliner label="Library Fee" entry="Rs. 1,000" />
            <Info_sameliner label="Examination Fee" entry="Rs. 1,500" />
            <Info_sameliner label="Development Fee" entry="Rs. 500" />
            <div className="total-row">
              <h3>Total Fee</h3>
              <h3>Rs. 15,000</h3>
            </div>
          </div>

          <div className="panel">
            <h2>Payment Summary</h2>
            <Info_sameliner label="Total Fee" entry="Rs. 15,000" />
            <Info_sameliner label="Paid" entry="Rs. 15,000" entryColor="var(--success)" />
            <Info_sameliner label="Balance" entry="Rs. 0" entryColor="var(--muted)" />
            <button className="button receipt-button">
              <Download size={18} />
              Download Receipt
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Payment History</h2>
          <div className="payment-row">
            <div>
              <strong>Rs. 15,000</strong>
              <p>15 January 2026</p>
              <p>Receipt: RCP001</p>
            </div>
            <div>
              <span className="status-pill paid">Paid</span>
              <button className="button button-secondary">Download</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Page;
