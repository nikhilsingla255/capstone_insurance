"# capstone_insurance" 

DRAFT:
User → createPolicy → policies collection

APPROVED:
User → approvePolicy
      ↓
   Update policy.status → ACTIVE
      ↓
   reinsuranceEngine()
      ↓
   treaties collection read
      ↓
   risk_allocations collection write
