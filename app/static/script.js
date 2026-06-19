const form = document.getElementById("registration-form");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");
const formAlert = document.getElementById("form-alert");
const successPanel = document.getElementById("success-panel");
const successRefId = document.getElementById("success-ref-id");
const newRegistrationBtn = document.getElementById("new-registration-btn");

const formCard = document.querySelector(".form-card");
const cnicInput = document.getElementById("cnic");
const mobileInput = document.getElementById("mobile");

function formatCnic(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

cnicInput.addEventListener("input", (e) => {
  const cursor = e.target.selectionStart;
  const before = e.target.value.length;
  e.target.value = formatCnic(e.target.value);
  const after = e.target.value.length;
  e.target.setSelectionRange(cursor + (after - before), cursor + (after - before));
});

mobileInput.addEventListener("input", (e) => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.startsWith("92")) val = val.slice(2);
  if (val.startsWith("0")) val = val.slice(1);
  e.target.value = val.slice(0, 10);
});

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  formAlert.hidden = true;
}

function showFieldErrors(errors) {
  for (const [field, message] of Object.entries(errors)) {
    const errorEl = document.querySelector(`.field-error[data-for="${field}"]`);
    const inputEl = document.getElementById(field);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add("invalid");
  }
}

function showAlert(message, type = "error") {
  formAlert.textContent = message;
  formAlert.className = `form-alert ${type}`;
  formAlert.hidden = false;
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.hidden = loading;
  btnLoader.hidden = !loading;
}

function getFormData() {
  let mobile = mobileInput.value.replace(/\D/g, "");
  if (mobile.length === 10) mobile = "0" + mobile;

  return {
    full_name: document.getElementById("full_name").value.trim(),
    father_or_husband_name: document.getElementById("father_or_husband_name").value.trim(),
    date_of_birth: document.getElementById("date_of_birth").value,
    cnic: cnicInput.value.trim(),
    address: document.getElementById("address").value.trim(),
    mobile,
  };
}

function validateClient(data) {
  const errors = {};

  if (!data.full_name || data.full_name.length < 2) {
    errors.full_name = "Please enter your full name.";
  }
  if (!data.father_or_husband_name || data.father_or_husband_name.length < 2) {
    errors.father_or_husband_name = "Please enter father's or husband's name.";
  }
  if (!data.date_of_birth) {
    errors.date_of_birth = "Please select your date of birth.";
  } else {
    const dob = new Date(data.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (dob >= today) errors.date_of_birth = "Date of birth must be in the past.";
    else if (age < 18) errors.date_of_birth = "Applicant must be at least 18 years old.";
  }
  if (!/^\d{5}-\d{7}-\d$/.test(data.cnic)) {
    errors.cnic = "CNIC must be in format 12345-1234567-1.";
  }
  if (!data.address || data.address.length < 5) {
    errors.address = "Please enter your complete address.";
  }
  if (!/^03\d{9}$/.test(data.mobile)) {
    errors.mobile = "Enter a valid Pakistani mobile number.";
  }

  return errors;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const data = getFormData();
  const clientErrors = validateClient(data);

  if (Object.keys(clientErrors).length > 0) {
    showFieldErrors(clientErrors);
    showAlert("Please fix the highlighted fields before submitting.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 422 && Array.isArray(result.detail)) {
        const errors = {};
        for (const item of result.detail) {
          const field = item.loc?.[item.loc.length - 1];
          if (field) errors[field] = item.msg;
        }
        showFieldErrors(errors);
        showAlert("Please fix the highlighted fields.");
      } else {
        showAlert(result.detail || "Something went wrong. Please try again.");
      }
      return;
    }

    formCard.hidden = true;
    successRefId.textContent = result.id.slice(-8).toUpperCase();
    successPanel.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    showAlert("Unable to connect. Please check your internet and try again.");
  } finally {
    setLoading(false);
  }
});

newRegistrationBtn.addEventListener("click", () => {
  form.reset();
  formCard.hidden = false;
  successPanel.hidden = true;
  clearErrors();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const dobInput = document.getElementById("date_of_birth");
const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 18);
dobInput.max = maxDob.toISOString().split("T")[0];
dobInput.min = "1920-01-01";
