import Header from "../components/Header";
import Hero from "../components/Hero";
import Impressions from "../components/Impressions";
import WorkshopsGrid from "../components/WorkshopsGrid";
import ReadyTerrariums from "../components/ReadyTerrariums";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Impressions />
        <WorkshopsGrid />
        <ReadyTerrariums />   {/* ← новый блок */}
      </main>
    </>
  );
}
