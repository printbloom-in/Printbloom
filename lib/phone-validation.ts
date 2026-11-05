/**
 * Shared phone validation utility for PrintBloom.
 * 
 * Rules:
 * 1. Indian numbers:
 *    - Must be 10 digits after removing +91, 91, or leading 0.
 *    - Must start with 6, 7, 8, or 9.
 *    - Rejects repetitive sequences (e.g. 0000000000, 1111111111, 9999999999).
 *    - Rejects obviously invalid patterns (fewer than 3 unique digits).
 * 2. International numbers:
 *    - Must start with '+' followed by country code.
 *    - Length must be between 8 and 15 digits (E.164).
 *    - Rejects repetitive numbers.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

export function validatePhoneNumber(rawPhone: string | null | undefined): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { isValid: false, normalized: "", error: "Phone number is required." };
  }

  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return { isValid: false, normalized: "", error: "Phone number cannot be empty." };
  }

  // Remove common separators: spaces, hyphens, brackets, dots
  const stripped = trimmed.replace(/[\s\-\(\)\.]/g, "");

  // International format check (starts with +)
  if (stripped.startsWith("+")) {
    const digitsOnly = stripped.slice(1);
    if (!/^\d+$/.test(digitsOnly)) {
      return { isValid: false, normalized: "", error: "Phone number contains invalid characters." };
    }

    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return { isValid: false, normalized: "", error: "International phone number must be 8–15 digits." };
    }

    // Check unique digits
    const uniqueDigits = new Set(digitsOnly);
    if (uniqueDigits.size <= 2) {
      return { isValid: false, normalized: "", error: "Invalid placeholder phone number." };
    }

    // If it's an Indian international number (+91...)
    if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
      const indian10 = digitsOnly.slice(2);
      return validateIndian10Digit(indian10);
    }

    return { isValid: true, normalized: `+${digitsOnly}` };
  }

  // Pure digits or local format
  let digits = stripped.replace(/\D/g, "");

  // If prefixed with 91 and has 12 digits (e.g. 919876543210)
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    // If prefixed with 0 and has 11 digits (e.g. 09876543210)
    digits = digits.slice(1);
  }

  return validateIndian10Digit(digits);
}

function validateIndian10Digit(digits: string): PhoneValidationResult {
  if (digits.length !== 10) {
    return {
      isValid: false,
      normalized: digits,
      error: "Mobile number must be exactly 10 digits.",
    };
  }

  // Indian numbers must begin with 6, 7, 8, or 9
  if (!/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      normalized: digits,
      error: "Indian mobile numbers must start with 6, 7, 8, or 9.",
    };
  }

  // Reject all same digits (e.g. 0000000000, 1111111111, 9999999999)
  if (/^(\d)\1{9}$/.test(digits)) {
    return {
      isValid: false,
      normalized: digits,
      error: "Please enter a valid mobile number, not a repeating sequence.",
    };
  }

  // Reject numbers with 2 or fewer unique digits (e.g. 9898989898)
  const uniqueCount = new Set(digits).size;
  if (uniqueCount <= 2) {
    return {
      isValid: false,
      normalized: digits,
      error: "Please enter a genuine mobile number.",
    };
  }

  return {
    isValid: true,
    normalized: digits,
  };
}

export function isValidPhoneNumber(rawPhone: string | null | undefined): boolean {
  return validatePhoneNumber(rawPhone).isValid;
}
