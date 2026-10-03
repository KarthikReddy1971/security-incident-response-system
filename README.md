# 🛡️ Security Incident Response System

A role-based security incident management platform that helps organizations **report, investigate, track, and resolve cybersecurity incidents** through a centralized system.

## 🚀 Features

- 🔐 Secure authentication with Supabase
- 👥 Role-based access: Employee, Analyst, Admin
- 🚨 Incident reporting and management
- 🔎 Incident investigation
- 💬 Investigation comments
- 📋 Incident history and event tracking
- 💻 Affected asset tracking
- 📊 Security dashboard
- 🛡️ PostgreSQL Row Level Security (RLS)

## 👥 Roles

| Role | Responsibilities |
|------|------------------|
| Employee | Report and track their incidents |
| Analyst | Investigate and update incidents |
| Admin | Manage incidents and assign analysts |

## 🔄 Incident Lifecycle

**Reported → Investigating → Contained → Resolved → Closed**

## 🏢 How It Helps Organizations

- Centralizes security incident reporting
- Helps security teams manage investigations systematically
- Provides visibility into incident status and progress
- Enables administrators to assign incidents to analysts
- Maintains investigation history and activities
- Protects sensitive incident data through role-based access and RLS
- Helps track affected systems and assets

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- PostgreSQL
- React Query

## ⚙️ Setup

```bash
git clone https://github.com/YOUR_USERNAME/security-incident-response-system.git
cd security-incident-response-system
npm install
npm run dev
````

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## 🎯 Purpose

This project demonstrates a real-world approach to **security incident management, role-based access control, secure authentication, database security, and incident response workflows**.

## 👨‍💻 Author

**Karthik Reddy** / KarthikReddy1971

[portfolio](https://karthikkportofolio.netlify.app/)

[GitHub](https://github.com/KarthikReddy1971) •
[LinkedIn](https://www.linkedin.com/in/karthik-reddy-buthukuri-25678328/)
