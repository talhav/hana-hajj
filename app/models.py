import re
from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


CNIC_PATTERN = re.compile(r"^\d{5}-\d{7}-\d$")
MOBILE_PATTERN = re.compile(r"^03\d{9}$")


class RegistrationCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    father_or_husband_name: str = Field(..., min_length=2, max_length=120)
    date_of_birth: date
    cnic: str = Field(..., min_length=15, max_length=15)
    address: str = Field(..., min_length=5, max_length=500)
    mobile: str = Field(..., min_length=11, max_length=11)

    @field_validator("full_name", "father_or_husband_name", "address")
    @classmethod
    def strip_and_validate_text(cls, value: str) -> str:
        cleaned = " ".join(value.strip().split())
        if not cleaned:
            raise ValueError("This field is required.")
        return cleaned

    @field_validator("cnic")
    @classmethod
    def validate_cnic(cls, value: str) -> str:
        cleaned = value.strip()
        if not CNIC_PATTERN.match(cleaned):
            raise ValueError("CNIC must be in format 12345-1234567-1.")
        return cleaned

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        cleaned = value.strip().replace(" ", "").replace("-", "")
        if cleaned.startswith("+92"):
            cleaned = "0" + cleaned[3:]
        elif cleaned.startswith("92") and len(cleaned) == 12:
            cleaned = "0" + cleaned[2:]
        if not MOBILE_PATTERN.match(cleaned):
            raise ValueError("Enter a valid Pakistani mobile number (e.g. 03001234567).")
        return cleaned

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, value: date) -> date:
        today = date.today()
        if value >= today:
            raise ValueError("Date of birth must be in the past.")
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise ValueError("Applicant must be at least 18 years old.")
        if age > 100:
            raise ValueError("Please enter a valid date of birth.")
        return value


class RegistrationResponse(BaseModel):
    id: str
    message: str
    created_at: datetime
