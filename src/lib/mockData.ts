export const monthlyRevenue = [
  { month: "Jan", revenue: 12400, users: 240 },
  { month: "Feb", revenue: 15800, users: 320 },
  { month: "Mar", revenue: 18200, users: 410 },
  { month: "Apr", revenue: 22100, users: 480 },
  { month: "May", revenue: 26500, users: 560 },
  { month: "Jun", revenue: 31200, users: 640 },
  { month: "Jul", revenue: 34800, users: 720 },
  { month: "Aug", revenue: 39400, users: 810 },
  { month: "Sep", revenue: 42100, users: 890 },
  { month: "Oct", revenue: 47600, users: 970 },
  { month: "Nov", revenue: 52800, users: 1080 },
  { month: "Dec", revenue: 58900, users: 1190 },
];

export const categoryData = [
  { name: "Development", value: 4200, color: "hsl(250 84% 60%)" },
  { name: "Design", value: 3100, color: "hsl(265 89% 70%)" },
  { name: "Business", value: 2400, color: "hsl(160 84% 42%)" },
  { name: "Marketing", value: 1800, color: "hsl(38 95% 55%)" },
  { name: "Other", value: 900, color: "hsl(200 90% 55%)" },
];

export const usersData = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", role: "Student", status: "active", joined: "2024-03-12", avatar: "SJ" },
  { id: 2, name: "Ahmed Al-Mansouri", email: "ahmed@example.com", role: "Instructor", status: "active", joined: "2024-02-08", avatar: "AM" },
  { id: 3, name: "Emily Chen", email: "emily@example.com", role: "Student", status: "active", joined: "2024-04-21", avatar: "EC" },
  { id: 4, name: "Marcus Weber", email: "marcus@example.com", role: "Student", status: "inactive", joined: "2023-11-30", avatar: "MW" },
  { id: 5, name: "Layla Hassan", email: "layla@example.com", role: "Instructor", status: "active", joined: "2024-01-15", avatar: "LH" },
  { id: 6, name: "Diego Martinez", email: "diego@example.com", role: "Student", status: "pending", joined: "2024-05-02", avatar: "DM" },
  { id: 7, name: "Priya Patel", email: "priya@example.com", role: "Student", status: "active", joined: "2024-03-28", avatar: "PP" },
  { id: 8, name: "James O'Connor", email: "james@example.com", role: "Instructor", status: "active", joined: "2023-09-14", avatar: "JO" },
];

export const instructorsData = [
  { id: 1, name: "Ahmed Al-Mansouri", title: "Full-Stack Engineering", courses: 12, students: 3420, revenue: 48200, rating: 4.9, avatar: "AM" },
  { id: 2, name: "Layla Hassan", title: "UI/UX Design Lead", courses: 8, students: 2180, revenue: 31500, rating: 4.8, avatar: "LH" },
  { id: 3, name: "James O'Connor", title: "Data Science Mentor", courses: 15, students: 4910, revenue: 67400, rating: 4.9, avatar: "JO" },
  { id: 4, name: "Sofia Rossi", title: "Marketing Strategist", courses: 6, students: 1540, revenue: 22800, rating: 4.7, avatar: "SR" },
  { id: 5, name: "Kenji Tanaka", title: "Mobile Development", courses: 10, students: 2870, revenue: 39600, rating: 4.8, avatar: "KT" },
  { id: 6, name: "Aisha Okafor", title: "Business Coach", courses: 7, students: 1920, revenue: 27300, rating: 4.6, avatar: "AO" },
];

export const coursesData = [
  { id: 1, title: "Advanced React Patterns", instructor: "Ahmed Al-Mansouri", category: "Development", students: 1240, rating: 4.9, price: 89, status: "published" },
  { id: 2, title: "Figma to Production", instructor: "Layla Hassan", category: "Design", students: 980, rating: 4.8, price: 69, status: "published" },
  { id: 3, title: "Machine Learning Foundations", instructor: "James O'Connor", category: "Data Science", students: 2140, rating: 4.9, price: 129, status: "published" },
  { id: 4, title: "Growth Marketing Playbook", instructor: "Sofia Rossi", category: "Marketing", students: 720, rating: 4.7, price: 79, status: "draft" },
  { id: 5, title: "iOS Development with Swift", instructor: "Kenji Tanaka", category: "Mobile", students: 1480, rating: 4.8, price: 99, status: "published" },
  { id: 6, title: "Startup Fundamentals", instructor: "Aisha Okafor", category: "Business", students: 640, rating: 4.6, price: 59, status: "published" },
];

export const paymentsData = [
  { id: "TXN-8421", student: "Sarah Johnson", course: "Advanced React Patterns", amount: 89, method: "Visa •• 4242", status: "completed", date: "2024-05-12" },
  { id: "TXN-8420", student: "Diego Martinez", course: "Figma to Production", amount: 69, method: "Mastercard •• 8810", status: "completed", date: "2024-05-12" },
  { id: "TXN-8419", student: "Priya Patel", course: "Machine Learning Foundations", amount: 129, method: "PayPal", status: "pending", date: "2024-05-11" },
  { id: "TXN-8418", student: "Marcus Weber", course: "iOS Development with Swift", amount: 99, method: "Visa •• 0019", status: "completed", date: "2024-05-11" },
  { id: "TXN-8417", student: "Emily Chen", course: "Startup Fundamentals", amount: 59, method: "Apple Pay", status: "refunded", date: "2024-05-10" },
  { id: "TXN-8416", student: "Sarah Johnson", course: "Growth Marketing Playbook", amount: 79, method: "Visa •• 4242", status: "completed", date: "2024-05-10" },
];

export const reviewsData = [
  { id: 1, student: "Sarah Johnson", course: "Advanced React Patterns", rating: 5, comment: "Absolutely brilliant. The patterns chapter alone was worth the price.", date: "2 days ago", avatar: "SJ" },
  { id: 2, student: "Diego Martinez", course: "Figma to Production", rating: 5, comment: "Layla's teaching style is incredibly clear. I went from beginner to confident in weeks.", date: "4 days ago", avatar: "DM" },
  { id: 3, student: "Emily Chen", course: "Machine Learning Foundations", rating: 4, comment: "Great content, would love more practical exercises in the later modules.", date: "1 week ago", avatar: "EC" },
  { id: 4, student: "Priya Patel", course: "iOS Development with Swift", rating: 5, comment: "Perfectly paced. Kenji explains complex concepts simply.", date: "1 week ago", avatar: "PP" },
  { id: 5, student: "Marcus Weber", course: "Startup Fundamentals", rating: 4, comment: "Good overview but I wished for deeper case studies.", date: "2 weeks ago", avatar: "MW" },
];

export const recentActivity = [
  { id: 1, user: "Sarah Johnson", action: "enrolled in", target: "Advanced React Patterns", time: "2m ago", type: "enroll" },
  { id: 2, user: "Ahmed Al-Mansouri", action: "published", target: "Next.js 15 Deep Dive", time: "18m ago", type: "publish" },
  { id: 3, user: "Diego Martinez", action: "completed", target: "Figma to Production", time: "1h ago", type: "complete" },
  { id: 4, user: "Layla Hassan", action: "received review on", target: "UI Animation Mastery", time: "2h ago", type: "review" },
  { id: 5, user: "Emily Chen", action: "submitted assignment for", target: "Machine Learning Foundations", time: "3h ago", type: "assignment" },
  { id: 6, user: "James O'Connor", action: "earned", target: "$1,240 in sales", time: "5h ago", type: "earnings" },
];

export const studentsProgress = [
  { id: 1, name: "Sarah Johnson", course: "Advanced React Patterns", progress: 78, lastActive: "2h ago", avatar: "SJ" },
  { id: 2, name: "Diego Martinez", course: "Advanced React Patterns", progress: 45, lastActive: "1d ago", avatar: "DM" },
  { id: 3, name: "Emily Chen", course: "TypeScript Mastery", progress: 92, lastActive: "30m ago", avatar: "EC" },
  { id: 4, name: "Marcus Weber", course: "Advanced React Patterns", progress: 23, lastActive: "5d ago", avatar: "MW" },
  { id: 5, name: "Priya Patel", course: "TypeScript Mastery", progress: 67, lastActive: "4h ago", avatar: "PP" },
  { id: 6, name: "Layla Hassan", course: "Advanced React Patterns", progress: 100, lastActive: "1w ago", avatar: "LH" },
];

export const examsData = [
  { id: 1, title: "React Fundamentals Quiz", course: "Advanced React Patterns", questions: 20, duration: 30, attempts: 142, avgScore: 78 },
  { id: 2, title: "Hooks Deep Dive", course: "Advanced React Patterns", questions: 15, duration: 25, attempts: 98, avgScore: 82 },
  { id: 3, title: "TypeScript Generics", course: "TypeScript Mastery", questions: 12, duration: 20, attempts: 76, avgScore: 71 },
  { id: 4, title: "Final Assessment", course: "TypeScript Mastery", questions: 30, duration: 60, attempts: 54, avgScore: 85 },
];

export const assignmentsData = [
  { id: 1, title: "Build a Todo App", student: "Sarah Johnson", course: "Advanced React Patterns", submitted: "2024-05-10", status: "pending", grade: null },
  { id: 2, title: "Custom Hook Challenge", student: "Diego Martinez", course: "Advanced React Patterns", submitted: "2024-05-09", status: "graded", grade: 92 },
  { id: 3, title: "Type-safe API Client", student: "Emily Chen", course: "TypeScript Mastery", submitted: "2024-05-08", status: "graded", grade: 88 },
  { id: 4, title: "Build a Todo App", student: "Marcus Weber", course: "Advanced React Patterns", submitted: "2024-05-08", status: "pending", grade: null },
  { id: 5, title: "Generic Utilities", student: "Priya Patel", course: "TypeScript Mastery", submitted: "2024-05-07", status: "revision", grade: 65 },
];

export const assistantsData = [
  { id: 1, name: "Yusuf Karim", email: "yusuf@example.com", courses: 3, role: "Lead TA", avatar: "YK" },
  { id: 2, name: "Nora Bishara", email: "nora@example.com", courses: 2, role: "Teaching Assistant", avatar: "NB" },
  { id: 3, name: "Tom Reilly", email: "tom@example.com", courses: 1, role: "Teaching Assistant", avatar: "TR" },
];
