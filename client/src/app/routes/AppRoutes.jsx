import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppShell from "../layout/AppShell";

import LoginPage from "../../app/features/auth/LoginPage";
import DashboardPage from "../../app/features/dashboard/DashboardPage";
import PolicyList from "../features/policy/PolicyList";
import CreatePolicyWizard from "../features/policy/CreatePolicyWizard";
import PolicyDetails from "../features/policy/PolicyDetails";
import TreatyList from "../features/reinsurance/TreatyList";
import TreatyForm from "../features/reinsurance/TreatyForm";
import ReinsurerList from "../features/reinsurance/ReinsurerList";
import RiskAllocationView from "../features/reinsurance/RiskAllocationView";
import ClaimsList from "../features/claim/ClaimsList";
import ClaimDetails from "../features/claim/ClaimDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN" , "UNDERWRITER", "REINSURANCE_ANALYST", "CLAIMS_ADJUSTER"]}>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* POLICY MODULE - UNDERWRITER */}
      <Route
        path="/policies"
        element={
          <ProtectedRoute allowedRoles={["UNDERWRITER"]}>
            <AppShell>
              <PolicyList />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/policies/create"
        element={
          <ProtectedRoute allowedRoles={["UNDERWRITER"]}>
            <AppShell>
              <CreatePolicyWizard />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/policies/:id"
        element={
          <ProtectedRoute allowedRoles={["UNDERWRITER", "ADMIN", "CLAIMS_ADJUSTER", "REINSURANCE_ANALYST"]}>
            <AppShell>
              <PolicyDetails />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* REINSURANCE MODULE - TREATIES */}
      <Route
        path="/reinsurance/treaties"
        element={
          <ProtectedRoute allowedRoles={["REINSURANCE_ANALYST", "ADMIN", "UNDERWRITER", "CLAIMS_ADJUSTER"]}>
            <AppShell>
              <TreatyList />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reinsurance/treaties/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["REINSURANCE_ANALYST", "ADMIN"]}>
            <AppShell>
              <TreatyForm />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* REINSURANCE MODULE - REINSURERS */}
      <Route
        path="/reinsurance/reinsurers"
        element={
          <ProtectedRoute allowedRoles={["REINSURANCE_ANALYST", "ADMIN"]}>
            <AppShell>
              <ReinsurerList />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* REINSURANCE MODULE - RISK ALLOCATION VIEW */}
      <Route
        path="/reinsurance/allocations/:policyId"
        element={
          <ProtectedRoute allowedRoles={["UNDERWRITER", "ADMIN", "REINSURANCE_ANALYST", "CLAIMS_ADJUSTER"]}>
            <AppShell>
              <RiskAllocationView />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* CLAIMS MODULE - CLAIMS ADJUSTER */}
      <Route
        path="/claims"
        element={
          <ProtectedRoute allowedRoles={["CLAIMS_ADJUSTER", "ADMIN"]}>
            <AppShell>
              <ClaimsList />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/claims/:id"
        element={
          <ProtectedRoute allowedRoles={["CLAIMS_ADJUSTER", "ADMIN"]}>
            <AppShell>
              <ClaimDetails />
            </AppShell>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;