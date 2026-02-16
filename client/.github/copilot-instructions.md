# Capstone Insurance System - Copilot Instructions

## 🎯 Project Purpose
Insurance policy lifecycle management with **automatic reinsurance allocation engine**. When an underwriter approves a policy exceeding retention limits, the system automatically calculates which reinsurers take portions of the risk based on treaty agreements.

---

## 🏗️ System Architecture Overview

### **Core Workflow: Policy Creation → Approval → Reinsurance Allocation**

```
1. UNDERWRITER creates policy (DRAFT state)
   └─ Form: policyNumber, insuredName, insuredType, LOB, 
              sumInsured, premium, retentionLimit, dateRange

2. UNDERWRITER approves policy
   └─ POST /policies/{policyNumber}/approve
   └─ Backend: Update status DRAFT → ACTIVE

3. REINSURANCE ENGINE AUTO-TRIGGERS
   └─ Find matching treaty (by LOB, dates, status)
   └─ Calculate allocation:
      - QUOTA_SHARE: Fixed % of sumInsured goes to reinsurer
      - SURPLUS: Only excess above retentionLimit goes to reinsurer
   └─ Create risk_allocations document (immutable record)
   └─ Return allocation details to frontend

4. FRONTEND shows success + allocation breakdown
   └─ Navigate to PolicyDetails
   └─ Display: Company retained vs Reinsurers' portions
```

---

## 📊 Data Models (Backend Schema)

### **Policy Collection**
```javascript
{
  _id: ObjectId,
  policyNumber: String (unique),           // e.g., "POL1001"
  insuredName: String,                     // e.g., "Rahul Sharma"
  insuredType: "INDIVIDUAL" | "CORPORATE",
  lineOfBusiness: "HEALTH" | "MOTOR" | "LIFE" | "PROPERTY",
  sumInsured: Number,                      // Total coverage (e.g., 10,000,000)
  premium: Number,                         // Annual premium (e.g., 50,000)
  retentionLimit: Number,                  // Company keeps this (e.g., 5,000,000)
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "EXPIRED",
  effectiveFrom: Date,
  effectiveTo: Date,
  createdBy: ObjectId (ref: User),
  approvedBy: ObjectId (ref: User),        // Set on approval
  createdAt: Date,
  updatedAt: Date
}
```

### **Treaty Collection**
Defines reinsurance agreements:
```javascript
{
  _id: ObjectId,
  treatyName: String,                      // e.g., "Treaty A"
  treatyType: "QUOTA_SHARE" | "SURPLUS",   // Type of allocation
  reinsurerId: ObjectId (ref: Reinsurer),
  sharePercentage: Number,                 // e.g., 30 (%)
  retentionLimit: Number,                  // Excess threshold for SURPLUS
  treatyLimit: Number,                     // Max this reinsurer takes
  applicableLOBs: [String],                // e.g., ["HEALTH", "MOTOR"]
  effectiveFrom: Date,
  effectiveTo: Date,
  status: "ACTIVE" | "EXPIRED",
  createdAt: Date,
  updatedAt: Date
}
```

### **Reinsurer Collection**
Insurance companies that provide reinsurance coverage:
```javascript
{
  _id: ObjectId,
  name: String (required),                 // e.g., "Swiss Re"
  code: String (unique, required),         // e.g., "SRE"
  country: String (required),              // e.g., "Switzerland"
  rating: "AAA" | "AA" | "A" | "BBB" (required),  // Credit rating
  contactEmail: String (required),         // e.g., "contact@swissre.com"
  status: "ACTIVE" | "INACTIVE" (required),
  createdAt: Date,
  updatedAt: Date
}
```

### **RiskAllocation Collection** ⭐ (CREATED ON APPROVAL)
Immutable record of allocation decision:
```javascript
{
  _id: ObjectId,
  policyId: ObjectId (ref: Policy),        // Which policy
  allocations: [                           // Array (can have multiple reinsurers)
    {
      reinsurerId: ObjectId,
      treatyId: ObjectId,
      allocatedAmount: Number,             // e.g., 1,500,000 (in ₹)
      allocatedPercentage: Number          // e.g., 30 (%)
    }
    // ... more if multiple treaties match
  ],
  retainedAmount: Number,                  // What company keeps (e.g., 5M)
  calculatedAt: Date,
  calculatedBy: ObjectId,                  // System user who calculated
  createdAt: Date,
  updatedAt: Date
}
```

### **AuditLog Collection** (Compliance)
Every action logged:
```javascript
{
  _id: ObjectId,
  entityType: "POLICY" | "CLAIM" | "TREATY" | "USER",
  entityId: ObjectId,
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE",
  oldValue: Object,
  newValue: Object,
  performedBy: ObjectId (ref: User),
  performedAt: Date,
  ipAddress: String,
  createdAt: Date
}
```

---

## 🎨 Frontend Components & Flow

### **Policy Module** (`src/app/features/policy/`)

| Component | Purpose | Key Logic |
|-----------|---------|-----------|
| **PolicyList** | Display all policies with status badges | GET /policies, iterate, show PolicyActions for each |
| **CreatePolicyWizard** | 3-step form (General → Coverage → Review) | Collect formData, POST /policies on submit |
| **PolicyStepGeneral** | Step 1 inputs | policyNumber, insuredName, insuredType, LOB (dropdown) |
| **PolicyStepCoverage** | Step 2 inputs | sumInsured, premium, retentionLimit, effectiveFrom/To dates |
| **PolicyStepReview** | Step 3 review | Display all fields in grid layout, confirm before submit |
| **PolicyActions** | Approve/Reject/View buttons | Calls approvePolicy(policyNumber), navigates to PolicyDetails on success |
| **PolicyDetails** | Full policy page + allocation | GET /policies/:id + getRiskAllocation(policyId), display AllocationSummary if ACTIVE |
| **PolicyStatusBadge** | Visual status indicator | DRAFT=gray, ACTIVE=green, SUSPENDED=orange, EXPIRED=red |

### **Reinsurance Module** (`src/app/features/reinsurance/`)

| Component | Purpose | Key Logic |
|-----------|---------|-----------|
| **TreatyList** | View all treaties + create modal | Displays treaties with type, reinsurer, LOBs, dates; REINSURANCE_ANALYST/ADMIN can create/edit/delete |
| **TreatyForm** | Edit-only form for treaties | Pre-filled from API, editable fields, PUT request on submit |
| **ReinsurerList** | Manage reinsurer entities | View all, create/edit/delete (REINSURANCE_ANALYST only) via modal |
| **RiskAllocationView** | Detailed allocation per policy | GET /risk-allocations/policy/:policyId, displays AllocationSummary + AllocationValidation + AllocationTable |
| **AllocationSummary** | High-level allocation breakdown | Cards showing company retained vs ceded; link to detailed view |
| **AllocationTable** | Detailed allocation grid | Row per reinsurer with amount, %, treaty type; summary totals |
| **AllocationValidation** | Compliance checks | Validates retention limits, totals match, treaty limits respected; shows risk breakdown |
| **AllocationSummary** | Show allocation breakdown | Receives allocation object, displays retained vs ceded in grid + table |

### **Service Files**

**policyService.js:**
```javascript
getPolicies()                           // GET /policies
getPolicyById(id)                       // GET /policies/:id
createPolicy(data)                      // POST /policies
approvePolicy(policyNumber)             // ⭐ POST /policies/{policyNumber}/approve
deletePolicy(id)                        // DELETE /policies/:id
rejectPolicy(id)                        // POST /policies/:id/reject (optional)
```

**treatyService.js:**
```javascript
getTreaties()                           // GET /treaties (returns array with populated reinsurerId)
getTreatyById(id)                       // GET /treaties/:id (for edit form pre-fill)
createTreaty(data)                      // POST /treaties (data includes: treatyName, treatyType, reinsurerId, sharePercentage, retentionLimit, treatyLimit, applicableLOBs, effectiveFrom, effectiveTo, status)
updateTreaty(id, data)                  // PUT /treaties/:id (same fields as create)
deleteTreaty(id)                        // DELETE /treaties/:id (hard delete with audit log)
```

**reinsurerService.js:**
```javascript
getReinsurers()                         // GET /reinsurers (returns all reinsurers)
getReinsurerById(id)                    // GET /reinsurers/:id (get single reinsurer details)
createReinsurer(data)                   // POST /reinsurers (data includes: name, code, country, rating, contactEmail, status) - ADMIN only
updateReinsurer(id, data)               // PUT /reinsurers/:id (same fields as create) - ADMIN only
deleteReinsurer(id)                     // DELETE /reinsurers/:id (hard delete) - ADMIN only
```

**reinsuranceService.js:**
```javascript
getRiskAllocation(policyId)             // GET /risk-allocations/policy/:policyId
getTreaties()                           // GET /treaties
getReinsurers()                         // GET /reinsurers (filters ACTIVE only for dropdowns)
getReinsurer(id)                        // GET /reinsurers/:id (get single reinsurer details)
```

---

## 🔄 Frontend-Backend Integration Example

### **Approval Flow (What Happens)**

```
User clicks "Approve" button on PolicyList
└─ PolicyActions.handleApprove()
   ├─ Confirmation dialog: "Approve policy? Reinsurance will be calculated."
   └─ User clicks OK
      └─ Call: approvePolicy("POL1001")  ← passes policyNumber
         └─ Backend: POST /policies/POL1001/approve
            ├─ Update policy: status = "ACTIVE", approvedBy = userId
            ├─ Call reinsuranceEngine(policy, userId)
            │  ├─ Find treaty where:
            │  │  - status = 'ACTIVE'
            │  │  - applicableLOBs includes "HEALTH"
            │  │  - effectiveFrom ≤ now ≤ effectiveTo
            │  └─ Calculate allocation based on treaty.treatyType
            │     - QUOTA_SHARE: treatyAmount = sumInsured × sharePercentage%
            │     - SURPLUS: treatyAmount = max(0, min(sumInsured - retentionLimit, treatyLimit))
            │  └─ Create RiskAllocation document
            └─ Response: { message: "...", allocation: {...} }
         └─ Frontend receives allocation data
            ├─ Show alert: "✅ Policy approved!\nRetained: ₹5M, Ceded: ₹5M"
            ├─ Refresh PolicyList (status badge updates to ACTIVE)
            └─ Navigate to /policies/{id} with allocation data
               └─ PolicyDetails page loads
                  └─ AllocationSummary displays:
                     - Company Retained: ₹5,000,000
                     - Reinsurer A: ₹1,500,000 (30%)
                     - Reinsurer B: ₹2,000,000 (40%)
                     - Reinsurer C: ₹1,500,000 (30%)
                     ✓ Total: ₹10,000,000
```

---

## 🎯 Routing Structure

```
/                              → LoginPage
/login                         → LoginPage
/dashboard                     → DashboardPage (UNDERWRITER, ADMIN)

POLICY MODULE:
/policies                      → PolicyList (UNDERWRITER)
/policies/create               → CreatePolicyWizard (UNDERWRITER)
/policies/:id                  → PolicyDetails (UNDERWRITER, ADMIN, CLAIMS_ADJUSTER, REINSURANCE_ANALYST)

REINSURANCE MODULE:
/reinsurance/treaties          → TreatyList (view + create modal, REINSURANCE_ANALYST/ADMIN can create)
/reinsurance/treaties/:id/edit → TreatyForm edit mode (REINSURANCE_ANALYST, ADMIN only)
/reinsurance/reinsurers        → ReinsurerList (view + create modal, REINSURANCE_ANALYST can create/edit/delete)
/reinsurance/allocations/:id   → RiskAllocationView (detailed allocation per policy)
/reinsurance/reinsurers        → ReinsurerList (view + create modal, ADMIN only)
```

---

## 👥 Role-Based Access Control

| Feature | UNDERWRITER | ADMIN | CLAIMS_ADJUSTER | REINSURANCE_ANALYST |
|---------|-------------|-------|-----------------|---------------------|
| Create Policy | ✅ | ✅ | ❌ | ❌ |
| Approve Policy | ✅ | ✅ | ❌ | ❌ |
| View Policies | ✅ | ✅ | ✅ | ✅ |
| View Allocation | ✅ | ✅ | ✅ | ✅ |
| View Treaties | ✅ | ✅ | ✅ | ✅ |
| Create Treaty | ❌ | ✅ | ❌ | ✅ |
| Edit Treaty | ❌ | ✅ | ❌ | ✅ |
| Delete Treaty | ❌ | ✅ | ❌ | ✅ |
| View Reinsurers | ✅ | ✅ | ✅ | ✅ |
| Create Reinsurer | ❌ | ❌ | ❌ | ✅ |
| Edit Reinsurer | ❌ | ❌ | ❌ | ✅ |
| Delete Reinsurer | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ✅ | ❌ | ❌ |

---

## 🎨 UI/UX Patterns

### **Styling Convention**
- **Framework**: Tailwind CSS (no CSS modules or inline styles)
- **Button Component**: `<Button variant="primary|secondary|danger" onClick={...}>`
- **Colors**:
  - Primary: `blue-600` (approval, actions)
  - Secondary: `gray-200` (neutral buttons)
  - Danger: `red-600` (delete, reject)
  - Success: `green-600` (status badge ACTIVE)
  - Warning: `orange-400` (status badge SUSPENDED)
- **Spacing**: `p-4` (padding), `mb-6` (margin-bottom), `space-y-4` (vertical gap)
- **Currency**: `₹{number.toLocaleString()}` (Indian format with commas)

### **Form Pattern**
- **No validation library** - Manual state management with useState
- **Text Input**: `<input type="text" value={state} onChange={(e) => setState(e.target.value)} />`
- **Select Dropdown**: `<select value={state} onChange={(e) => setState(e.target.value)}>`
- **Date Input**: `<input type="date" value={state} onChange={(e) => setState(e.target.value)} />`
- **Number Input**: `<input type="number" value={state} onChange={(e) => setState(e.target.value)} />`

### **Loading & Error States**
```javascript
if (loading) return <Loader />;
if (error) return <div className="bg-red-100 text-red-700 p-4">{error}</div>;
if (!data) return <div className="bg-yellow-100 text-yellow-700 p-4">Not found</div>;
```

### **Shared Components** (`src/app/shared/components/`)
- `Button.jsx` - Styled button with variants
- `Card.jsx` - Container with padding & shadow
- `Badge.jsx` - Status pill
- `Loader.jsx` - Loading spinner
- `Input.jsx` - Form input wrapper

---

## 🚀 Development Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build to /dist
npm run lint     # ESLint check
npm run preview  # Preview production build locally
```

---

## 🔑 Critical Implementation Notes

### **1. Endpoint Names Matter** ⭐
Backend expects:
- Policy approval: `POST /policies/{policyNumber}/approve` (NOT by ID!)
- Risk allocation: `GET /risk-allocations/policy/{policyId}` (by policy ID)

### **2. Allocation is Automatic**
- Triggered by policy approval, NOT manual
- Uses ONE matching treaty (backend finds first match)
- Result stored in RiskAllocation collection
- Immutable after creation

### **3. Status Flow**
```
DRAFT ──(approve)──> ACTIVE ──(endorse)──> Updated
   ↓
(reject or delete)
```

### **4. Form Fields Must Match Schema**
When creating policy, POST payload must include:
```javascript
{
  policyNumber: String (required),
  insuredName: String (required),
  insuredType: "INDIVIDUAL" | "CORPORATE",
  lineOfBusiness: "HEALTH" | "MOTOR" | "LIFE" | "PROPERTY",
  sumInsured: Number (required),
  premium: Number (required),
  retentionLimit: Number (required),
  effectiveFrom: Date (YYYY-MM-DD format from HTML5 date input),
  effectiveTo: Date (YYYY-MM-DD format)
}
```

### **5. Authentication Flow**
- Login: POST /auth/login → returns `{ token, user }`
- Token stored in localStorage
- Auto-injected in all requests via apiClient interceptor
- Logout clears localStorage

### **6. Error Handling**
Currently:
- Errors logged to console
- Frontend shows alert() dialog
- Consider adding toast notifications for better UX

---

## 🏛️ Treaty Management (Reinsurance Module)

### **What are Treaties?**
Treaties are reinsurance agreements that define how risk is shared between the insurance company and reinsurers. When an underwriter approves a policy, the system automatically finds matching treaties and allocates portions of the risk.

**Key:** Treaties are independent of Users. A REINSURANCE_ANALYST user can create treaties for ANY reinsurer (selected via dropdown), not just their own company.

### **Treaty Types**

**QUOTA_SHARE:**
- Fixed percentage of ALL policies (regardless of size) goes to reinsurer
- Example: "30% of all HEALTH policies"
- Calculation: `allocatedAmount = sumInsured × sharePercentage / 100`
- Best for: Stability, spreading large exposures evenly

**SURPLUS:**
- Only excess above retention limit goes to reinsurer
- Example: "Everything above ₹5M goes to reinsurer, up to ₹10M total"
- Calculation: `allocatedAmount = max(0, min(sumInsured - retentionLimit, treatyLimit))`
- Best for: Protecting against catastrophic losses, flexible attachment points

### **Treaty Creation Flow**

```
REINSURANCE_ANALYST clicks "Create Treaty" button on TreatyList
└─ Modal appears (CreateTreatyModal component)
   ├─ Form fields in modal:
   │  ├─ Treaty Name (text, required)
   │  ├─ Treaty Type (dropdown: QUOTA_SHARE or SURPLUS)
   │  ├─ Reinsurer (dropdown of ACTIVE reinsurers, required)
   │  ├─ Share Percentage (0-100)
   │  ├─ Retention Limit (₹)
   │  ├─ Treaty Limit (₹)
   │  ├─ Applicable LOBs (checkboxes: HEALTH, MOTOR, LIFE, PROPERTY - any combination)
   │  ├─ Effective From & To (dates)
   │  └─ Status (dropdown: ACTIVE or EXPIRED)
   └─ User clicks "Create Treaty" button
      └─ Form validation:
         ├─ Treaty name required
         ├─ Reinsurer required
         ├─ At least 1 LOB selected
         ├─ Effective To > Effective From
      └─ On success: POST /treaties with formData (includes reinsurerId from dropdown)
         └─ Backend: Create Treaty + AuditLog
         └─ UI: Close modal, reload TreatyList, show success alert
      └─ On error: Show error alert in modal, let user fix and resubmit
```

### **Treaty Edit Flow**

```
User clicks Edit button on treaty row
└─ Navigate to /reinsurance/treaties/{id}/edit
   └─ TreatyForm loads with existing treaty data
      ├─ Reinsurer dropdown pre-populated from existing treaty
      ├─ All other fields pre-filled from API
      └─ User modifies fields (including Reinsurer if needed) and clicks "Update Treaty"
         └─ PUT /treaties/{id} with updated formData
         └─ Backend: Update Treaty + AuditLog
         └─ UI: Navigate back to /reinsurance/treaties, show success alert
```

### **Treaty List Operations**

**View Treaties:**
```
TreatyList component displays table with columns:
├─ Treaty Name
├─ Type Badge (QUOTA_SHARE = blue, SURPLUS = orange)
├─ Reinsurer Name (populated via API call)
├─ Share / Limit (displays sharePercentage for QUOTA, treatyLimit for SURPLUS)
├─ LOBs (HEALTH chip, MOTOR chip)
├─ Effective Dates (From - To)
├─ Status Badge (ACTIVE = green, EXPIRED = red)
└─ Actions (Edit, Delete buttons - visible only for REINSURANCE_ANALYST + ADMIN)
```

**Edit Treaty:**
- Click Edit button → Navigate to /reinsurance/treaties/:id
- TreatyForm loads with existing data via getTreatyById(id)
- All fields become editable
- Submit calls updateTreaty(id, formData)
- Backend: Update Treaty + AuditLog (action="UPDATE", oldValue captured, newValue = new data)

**Delete Treaty:**
- Click Delete button → Confirmation dialog: "Delete this treaty? This will affect future allocations."
- On confirm: DELETE /treaties/:id
- Backend: Hard delete + AuditLog (action="DELETE", oldValue = treaty data, newValue=null)
- UI: Remove row from table, show success alert

---

## 📋 Completed Components

### **Policy Module**
✅ PolicyList - Display all policies with status badges (DRAFT/ACTIVE/SUSPENDED/EXPIRED)  
✅ CreatePolicyWizard - 3-step form (General → Coverage → Review)  
✅ PolicyStepGeneral - Collects policyNumber, insuredName, insuredType, lineOfBusiness  
✅ PolicyStepCoverage - Collects sumInsured, premium, retentionLimit, effectiveFrom/To dates  
✅ PolicyStepReview - Displays all fields in grid format with ₹ formatting  
✅ PolicyActions - Approve/View buttons with role-based authorization  
✅ PolicyDetails - Full policy view with reinsurance allocation breakdown  
✅ PolicyStatusBadge - Visual status indicators  
✅ policyService.js - Complete CRUD + approvePolicy(policyNumber endpoint)  

### **Reinsurance Module**
✅ AllocationSummary - Displays company retained vs reinsurers ceded (cards + detailed table)  
✅ TreatyList - Full CRUD UI for treaties; displays treatyName, type, reinsurer, sharePercentage, LOBs, dates, status  
✅ TreatyForm - Multi-step form for create/edit treaties; supports QUOTA_SHARE & SURPLUS types  
✅ ReinsurerList - Full CRUD UI for reinsurers; REINSURANCE_ANALYST can create/edit/delete  
✅ treatyService.js - getTreaties, getTreatyById, createTreaty, updateTreaty, deleteTreaty  
✅ reinsurerService.js - getReinsurers, getReinsurerById, createReinsurer, updateReinsurer, deleteReinsurer  
✅ reinsuranceService.js - getRiskAllocation, getTreaties, getReinsurers, getReinsurer  
✅ RiskAllocationView - Standalone page showing detailed allocation breakdown with validation  
✅ AllocationTable - Grid displaying reinsurer allocations with amounts, percentages, treaty calculations  
✅ AllocationValidation - Compliance checks validating retention limits, treaty limits, and allocation totals  
✅ Routes - All reinsurance routes configured with role-based access  

---

## 📝 Next Steps (Future Features)

1. **Claims Module** - ClaimsList → ClaimCreateForm → ClaimDetails → ClaimActionPanel → ClaimStatusTimeline
2. **PolicyHistory component** - Show audit trail of changes in timeline format
3. **Dashboard Charts** - Exposure by LOB, Loss ratio, Reinsurer distribution (use Recharts)
4. **Admin Module** - User management, role matrix, permission editor
5. **Toast Notifications** - Replace alert() with toast UI library
6. **Form Validation Enhancement** - Add field requirement indicators, date range checks, numeric bounds
7. **Pagination & Filtering** - For PolicyList, ClaimsList, TreatyList
8. **Endorsement Flow** - Update active policies with Endorse button
9. **Error Boundary** - Global error handling component

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Policy not found" error | Check that backend returns policy with user references populated (populate 'createdBy', 'approvedBy') |
| Allocation not showing | Ensure policy.status = "ACTIVE" before trying to fetch allocation. RiskAllocation only created on approval. |
| Approval button not visible | Check user.role is "UNDERWRITER" or "ADMIN" and policy.status = "DRAFT" |
| Date format issues | HTML5 date input stores as "YYYY-MM-DD"; ensure backend accepts ISO format |
| API calls failing | Ensure backend runs on localhost:5000; check CORS configuration |

---

## 💡 Key Insights

1. **The heart of the system**: reinsuranceEngine automatically calculates risk splits
2. **retentionLimit is crucial**: Determines if reinsurance kicks in
3. **Allocations are historical**: Never edited, only queried for claims settlement
4. **Audit trail is mandatory**: Every approval/update logged for compliance
5. **No form libraries**: Pure React useState/useEffect pattern for simplicity
6. **Tailwind everywhere**: Consistent styling, no CSS clutter
