import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import { Navigate } from "react-router-dom";
import "./index.css";
import MenuPage from "./pages/MenuPage";
import DashboardPage from "./pages/DashboardPage";
import FeaturePage from "./pages/FeaturePage";
import GoalsAndChallengesPage from "./pages/GoalsAndChallenges";
import ProfilePage from "./pages/ProfilePage";
import BudgetPlanner from "./pages/BudgetPlanner";
import ReceiptScanner from "./pages/ReceiptScanner";
import { EntryProvider } from "./Context/EntryContext";
import BudgetEntry from "./pages/BudgetEntryPage";
import AllEntriesPage from "./pages/AllEntriesPage";
// … rest of App.jsx unchanged …

function App() {
  return (
    <EntryProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/features" element={<FeaturePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/goals-challenges" element={<GoalsAndChallengesPage />} />
        <Route path="/budget-entry" element={<BudgetEntry />} />
        <Route path="/all-entries" element={<AllEntriesPage />} />
        <Route path="/budget-planner" element={<BudgetPlanner />} />
        <Route path="/receipt-scanner" element={<ReceiptScanner />} />
      </Routes>
    </EntryProvider>
  );
}

export default App;
