import Hero from "../components/home/Hero";
import ProblemSolution from "../components/home/ProblemSolution";
import HowToUse from "../components/home/HowToUse";
import FAQ from "../components/home/FAQ";
import CTA from "../components/common/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <HowToUse />
      <FAQ />
      <CTA />
    </>
  );
}
