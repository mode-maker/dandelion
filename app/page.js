import Header from "../components/Header";
import Hero from "../components/Hero";
import Impressions from "../components/Impressions";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Impressions />
      </main>
    </>
  );
}
import WorkshopsGrid from "../components/WorkshopsGrid";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Impressions />
        <WorkshopsGrid />
      </main>
    </>
  );
}
