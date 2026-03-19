import { Calculator, Camera, Grid2x2, PlusCircle, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import MenuCard from "../components/MenuCard";

const cards = [
  {
    id: "dashboard",
    badge: "Overview",
    title: "Dashboard",
    description: "View spending summaries, charts, and AI-powered insights",
    icon: <Grid2x2 size={20} />,
    colorClass: "bg-blue-600",
    route: "/dashboard",
  },
  {
    id: "budget",
    badge: "Plan",
    title: "Budget Planner",
    description: "Set budgets, track allocations, and get AI suggestions",
    icon: <Calculator size={20} />,
    colorClass: "bg-emerald-500",
    route: "/budget-planner",
  },
  {
    id: "scanner",
    badge: "Scan",
    title: "Receipt Scanner",
    description: "Scan paper receipts with OCR technology",
    icon: <Camera size={20} />,
    colorClass: "bg-amber-500",
    route: "/receipt-scanner",
  },
  {
    id: "goals",
    badge: "Achieve",
    title: "Goals & Challenges",
    description: "Set financial goals, track progress, and earn rewards",
    icon: <Target size={20} />,
    colorClass: "bg-violet-500",
    route: "/goals-challenges",
  },
  {
    id: "entry",
    badge: "Add",
    title: "Budget Entry",
    description: "Manually add expenses and income entries",
    icon: <PlusCircle size={20} />,
    colorClass: "bg-rose-500",
    route: "/budget-entry",
  },
];

function MenuPage() {
  const navigate = useNavigate();

  return (
    <div>
      <TopBar profile={{ name: "Regan Karki", tier: "Premium", locale: "Nepal" }} />

      <main className="mx-auto w-full max-w-[1600px] px-6 pb-14 pt-12 md:px-10">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-blue-400">Namaste, Regan</p>
          <h1 className="mt-5 max-w-xl text-5xl leading-tight md:text-6xl">
            What would you like to <span className="text-blue-500">explore</span> today?
          </h1>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2 xl:mx-auto xl:max-w-4xl">
          {cards.map((card, index) => (
            <div key={card.id} className={index === 4 ? "md:col-span-2 md:mx-auto md:w-[62%]" : ""}>
              <MenuCard {...card} onEnter={card.route ? () => navigate(card.route) : undefined} />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default MenuPage;
