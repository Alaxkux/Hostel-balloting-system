export const VALID_LEVELS = [100, 200, 300, 400, 500, 600]
export const MAX_CAPACITY = 5000

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[\p{L}][\p{L}\s.'-]*$/u
const SESSION_REGEX = /^(\d{4})\/(\d{4})$/

// Every validator returns an object like { fieldName: 'error message' }.
// An empty object means the form is valid.
// These mirror the rules on the backend, so the user sees the message before the server has to reject anything.

export function validateStudentForm({ name, email, level, faculty, department }) {
  const errors = {}
  const cleanName = name.trim()

  if (!cleanName) errors.name = 'Full name is required'
  else if (cleanName.length > 100) errors.name = 'Full name is too long (100 characters max)'
  else if (!NAME_REGEX.test(cleanName)) errors.name = 'Use letters, spaces, hyphens, apostrophes and full stops only'

  if (email.trim() && !EMAIL_REGEX.test(email.trim())) errors.email = 'Enter a valid email address'

  if (!VALID_LEVELS.includes(Number(level))) errors.level = 'Choose a level from 100 to 600'

  if (!faculty.trim()) errors.faculty = 'Faculty is required'
  if (!department.trim()) errors.department = 'Department is required'

  return errors
}

// used on the Hostel Management page (next step)
// "occupied" is how many bed spaces are already taken, so capacity can never drop below it
export function validateHostelForm({ name, gender, capacity, location }, occupied = 0) {
  const errors = {}
  const cleanName = name.trim()

  if (!cleanName) errors.name = 'Hostel name is required'
  else if (cleanName.length > 100) errors.name = 'Hostel name is too long (100 characters max)'

  if (gender !== 'male' && gender !== 'female') errors.gender = 'Choose male or female'

  const cap = String(capacity).trim()
  if (!/^\d+$/.test(cap)) errors.capacity = 'Capacity must be a whole number'
  else if (Number(cap) < 1 || Number(cap) > MAX_CAPACITY) errors.capacity = `Capacity must be between 1 and ${MAX_CAPACITY}`
  else if (Number(cap) < occupied) errors.capacity = `Capacity cannot be lower than the ${occupied} bed spaces already occupied`

  if (location.trim().length > 150) errors.location = 'Location is too long (150 characters max)'

  return errors
}

// used on the Ballot Management page (step after that)
export function validateRoundForm({ session, startDate, endDate }) {
  const errors = {}
  const match = session.trim().match(SESSION_REGEX)

  if (!match) errors.session = 'Use the format 2025/2026'
  else if (Number(match[2]) !== Number(match[1]) + 1) errors.session = 'The two years must follow each other, e.g. 2025/2026'

  if (!startDate) errors.startDate = 'Start date is required'

  if (!endDate) errors.endDate = 'End date is required'
  else if (startDate && endDate < startDate) errors.endDate = 'End date cannot be before the start date'

  return errors
}