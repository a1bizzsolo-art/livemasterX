import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/landing/Nav";
import Hero from "../components/landing/Hero";
import Ticker from "../components/landing/Ticker";
import Systems from "../components/landing/Systems";
import Ariah from "../components/landing/Ariah";
import LiveField from "../components/landing/LiveField";
import Copernicus from "../components/landing/Copernicus";
import Outcomes from "../components/landing/Outcomes";
import Pricing from "../components/landing/Pricing";
import Roadmap from "../components/landing/Roadmap";
import Waitlist from "../components/landing/Waitlist";
import Footer from "../components/landing/Footer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Landing() {
  const [stats, setStats] = useState({
    total: 0,
    agents_online: 10000,
    fields_under_watch: 1284,
    uptime: "99.997%",
  });

  useEffect(() => {
    let mounted = true;
    axios.get(`${API}/waitlist/stats`).then((r) => mounted && setStats(r.data)).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const refreshStats = async () => {
    try {
      const r = await axios.get(`${API}/waitlist/stats`);
      setStats(r.data);
    } catch {
      /* noop */
    }
  };

  return (
    <main data-testid="landing-page" className="bg-[#0A0A0C] text-white min-h-screen">
      <Nav />
      <Hero stats={stats} />
      <Ticker />
      <Systems />
      <Ariah />
      <LiveField api={API} />
      <Copernicus />
      <Outcomes />
      <Pricing api={API} />
      <Roadmap />
      <Waitlist api={API} onJoined={refreshStats} stats={stats} />
      <Footer />
    </main>
  );
}
