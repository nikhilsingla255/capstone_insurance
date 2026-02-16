import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPolicy } from "./policyService";

import PolicyStepGeneral from "./PolicyStepGeneral";
import PolicyStepCoverage from "./PolicyStepCoverage";
import PolicyStepReview from "./PolicyStepReview";

import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";

const CreatePolicyWizard = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    policyNumber: "",
    insuredName: "",
    insuredType: "INDIVIDUAL",
    lineOfBusiness: "",
    sumInsured: "",
    premium: "",
    retentionLimit: "",
    effectiveFrom: "",
    effectiveTo: "",
  });

  // Validation for Step 1: General Info
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = "Policy Number is required";
    }
    if (!formData.insuredName.trim()) {
      newErrors.insuredName = "Insured Name is required";
    }
    if (!formData.lineOfBusiness) {
      newErrors.lineOfBusiness = "Line of Business is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 2: Coverage Info
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.sumInsured || Number(formData.sumInsured) <= 0) {
      newErrors.sumInsured = "Sum Insured must be greater than 0";
    }
    if (!formData.premium || Number(formData.premium) <= 0) {
      newErrors.premium = "Premium must be greater than 0";
    }
    if (!formData.retentionLimit || Number(formData.retentionLimit) <= 0) {
      newErrors.retentionLimit = "Retention Limit must be greater than 0";
    }
    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective From date is required";
    }
    if (!formData.effectiveTo) {
      newErrors.effectiveTo = "Effective To date is required";
    }
    if (formData.effectiveFrom && formData.effectiveTo && new Date(formData.effectiveFrom) >= new Date(formData.effectiveTo)) {
      newErrors.effectiveTo = "Effective To must be after Effective From";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    // Validate current step before moving to next
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // if (!validateStep1() || !validateStep2()) return;

    try {
      await createPolicy(formData);
      alert("✅ Policy created successfully!");
      navigate("/policies");
    } catch (err) {
      alert(`❌ Failed to create policy: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  return (
    <Card>
      <h1 className="text-xl font-bold mb-6">Create Policy</h1>

      {step === 1 && (
        <PolicyStepGeneral
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />
      )}

      {step === 2 && (
        <PolicyStepCoverage
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />
      )}

      {step === 3 && (
        <PolicyStepReview formData={formData} />
      )}

      <div className="flex justify-between items-center mt-6">
        <div>
          {step > 1 && (
            <Button variant="secondary" onClick={prevStep}>
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {step < 3 && (
            <Button onClick={nextStep}>
              Next
            </Button>
          )}

          {step === 3 && (
            <Button variant="primary" onClick={handleSubmit}>
              Submit Policy
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CreatePolicyWizard;