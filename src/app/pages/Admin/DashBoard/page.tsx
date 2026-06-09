"use client";

import All from "@/src/app/components/All";
import COPA from "@/src/app/components/COPA";
import Electrician from "@/src/app/components/Electrician";
import Fitter from "@/src/app/components/Fitter";
import StuNav from "@/src/app/components/StuNav";
import Image from "next/image";
import { useState } from "react";

const Page = () => {
  const [course, setCourse] = useState("All");

  return (
    <>
      <StuNav name="Admin Dashboard" role="admin" />

      <main className="dashboard-page">
        <section className="panel">
          <div className="panel-heading">
            <Image src="/file.svg" alt="" width={20} height={20} />
            <h2>Filter by Course</h2>
          </div>

          <div className="segment-control">
            {["All", "Electrician", "COPA", "Fitter"].map((item) => (
              <button
                key={item}
                onClick={() => setCourse(item)}
                className={course === item ? "active" : ""}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="panel admin-content">
          {course === "All" && <All />}
          {course === "Electrician" && <Electrician />}
          {course === "COPA" && <COPA />}
          {course === "Fitter" && <Fitter />}
        </section>
      </main>
    </>
  );
};

export default Page;
