export interface Account {
  name: string
  email: string
  phone: string
  city: string
  bio: string
  role: string
}

export interface Domain {
  name: string
  id: string
  label: string
  description: string
  color: string
}

export interface Tier {
  name: string
  label: string
  minPoints: number
  minCourses: number
  requiredEnglish: string
  color: string
  price: number
}

export interface Course {
  id: string
  domainId: string
  title: string
  description: string
  instructorName: string
  level: string
  durationHours: number
  progressPercent: number
  isEnrolled: boolean
  isCompleted: boolean
  modulesCount: number
  rating: number
  nextSessionFata: string | null
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  durationMinutes: number
  orderIndex: number
  contentMarkdown: string
  isCompleted: boolean
  quizQuestion: string
  options: string[]
  quizCorrectIndex: number
  quizExplanation: string
}

export interface Flashcard {
  id: string
  domainId: string
  front: string
  back: string
  hint: string
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export interface Badge {
  id: string
  name: string
  tier: string
  domainId: string
  pointsRequired: number
  coursesRequired: number
  englishRequired: string
  isUnlocked: boolean
  unlockedDate: string | null
  iconEmoji: string
  description: string
}

export interface Attestation {
  id: string
  certificateNumber: string
  title: string
  domainName: string
  recipientName: string
  issueDate: string
  tier: string
  priceFcfa: number
  isPaid: boolean
  paymentMethod: string | null
  verificationUrl: string
  expertSigner: string
  expertRole: string
}

export interface Job {
  id: string
  title: string
  companyName: string
  location: string
  type: string
  domainId: string
  badgeRequired: string
  salaryRange: string
  isApplied: boolean
  description: string
  requirements: string
}

export interface Project {
  id: string
  title: string
  domainId: string
  description: string
  status: string
  teamSize: number
  targetKpi: string
  mentorName: string
  repoUrl: string
  isStartupIncubated: boolean
}

export interface Message {
  id: string
  domainId: string
  senderName: string
  senderRole: string
  messageText: string
  timestampText: string
  isUser: boolean
  reactionsCount: number
}

export interface Profile {
  id: number
  fullName: string
  email: string
  phone: string
  bio: string
  role: string
  location: string
  points: number
  streakDays: number
  currentBadgeLevel: string
  englishLevel: string
  completedCoursesCount: number
  publishedProjectsCount: number
  wonChallengesCount: number
  isVerified: boolean
}

export interface Seed {
  profile: Profile
  courses: Course[]
  lessons: Lesson[]
  flashcards: Flashcard[]
  badges: Badge[]
  attestations: Attestation[]
  jobs: Job[]
  projects: Project[]
  messages: Message[]
  domains: Domain[]
  tiers: Tier[]
}
