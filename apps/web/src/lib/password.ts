export interface PasswordStrength {
  length:    boolean  // >= 8 chars
  uppercase: boolean  // at least one A-Z
  lowercase: boolean  // at least one a-z
  number:    boolean  // at least one 0-9
  special:   boolean  // at least one non-alphanumeric (optional)
  score:     number   // 0-5 (required pass = 4: length + upper + lower + number)
}

export function checkPassword(password: string): PasswordStrength {
  const length    = password.length >= 8
  const uppercase = /[A-Z]/.test(password)
  const lowercase = /[a-z]/.test(password)
  const number    = /[0-9]/.test(password)
  const special   = /[^A-Za-z0-9]/.test(password)
  const score     = [length, uppercase, lowercase, number, special].filter(Boolean).length
  return { length, uppercase, lowercase, number, special, score }
}

export function isPasswordValid(password: string): boolean {
  const p = checkPassword(password)
  return p.length && p.uppercase && p.lowercase && p.number
}

export const PASSWORD_RULES: Array<{ key: keyof Omit<PasswordStrength, 'score'>; label: string; required: boolean }> = [
  { key: 'length',    label: 'At least 8 characters',       required: true  },
  { key: 'uppercase', label: 'One uppercase letter (A–Z)',   required: true  },
  { key: 'lowercase', label: 'One lowercase letter (a–z)',   required: true  },
  { key: 'number',    label: 'One number (0–9)',             required: true  },
  { key: 'special',   label: 'Special character (optional)', required: false },
]
