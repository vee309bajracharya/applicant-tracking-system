# Project: SmartHire ATS
<img width="500" alt="download" src="https://github.com/user-attachments/assets/8be2cd72-07d9-4940-8728-f4e315bd5f63" />

## Introduction

SmartHire ATS is a full-stack Applicant Tracking System that replaces spreadsheet-and-email hiring with a single pipeline: job postings, candidate applications, resume parsing, skill-based match scoring, interview scheduling, and role-based dashboards for Admins, HR Managers, Recruiters, and Candidates. It is built as a decoupled REST API (Laravel) with a separate single-page frontend (React), and enforces every permission on the server, never just in the UI.

The system supports four roles: 
- **Admin** (platform and user management)
- **HR Manager** (job lifecycle and final hiring decisions)
- **Recruiter** (candidate screening and interviews) 
- **Candidate** (profile, resume, and applications).

## Key Features

- Role-based access control across four roles, enforced server-side with Spatie Permission
- Candidate registration, login, email verification, OTP password reset, and Google OAuth
- Company and department management with staff assignment
- Candidate profiles with resume upload, automatic text extraction, and skill tagging
- Job posting lifecycle: draft, publish, close, archive, restore
- A finite-state-machine-driven application pipeline (Applied to Hired) with an immutable status history
- Automated candidate match scoring: skill overlap, experience fit, keyword matching, and a TF-IDF cosine similarity score, combined into one weighted final score
- Skill gap analysis and ranked candidate lists per job
- Interview scheduling with feedback and rating capture
- Automated notifications on application and interview status changes
- A rule-based FAQ chatbot for common platform questions

## Tech Stack

| Components | Technology | Badge |
| :--- | :--- | :--- |
| **Backend Framework** | **Laravel 13** | ![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white) |
| **Language (Backend)** | **PHP 8.3** | ![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white) |
| **Database** | **MySQL** | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) |
| **Auth** | **Laravel Sanctum** | ![Sanctum](https://img.shields.io/badge/Sanctum-FF2D20?style=for-the-badge&logo=laravel&logoColor=white) |
| **Authorization** | **Spatie Permission** | ![Spatie](https://img.shields.io/badge/Spatie%20Permission-2D2D2D?style=for-the-badge) |
| **Frontend Library** | **React 19** | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) |
| **Build Tool** | **Vite** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) |
| **Styling** | **Tailwind CSS** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **Data Fetching** | **Axios + TanStack Query** | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) |
| **Routing** | **React Router** | ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) |
| **Form Handling** | **React Hook Form + Yup** | ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white) |
| **Animation** | **Framer Motion** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) |
| **Package Manager** | **npm** | ![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) |
| **CI/CD** | **GitHub Actions** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) |

## Prerequisites

Install the following before setting up the project:

| Requirement | Minimum Version | Badge |
| :--- | :--- | :--- |
| **PHP** | 8.3 | ![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white) |
| **Composer** | 2.x | ![Composer](https://img.shields.io/badge/Composer-885630?style=for-the-badge&logo=composer&logoColor=white) |
| **Node.js** | 18.x or later | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) |
| **npm** | 9.x or later | ![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) |
| **MySQL** | 8.x | ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white) |
| **Git** | any recent version | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) |

## Project Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/applicant-tracking-system.git
cd applicant-tracking-system
```

### 2. Backend setup (Laravel)

```bash
cd back-end
composer install
cp .env.example .env
php artisan key:generate
```

Open `.env` and set your database credentials, mail settings, and Google OAuth keys, then:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

The API will be available at `http://localhost:8000/api/v1`.

### 3. Frontend setup (React)

```bash
cd ../front-end
npm install
cp .env.example .env
```

Set `VITE_API_BASE_URL` in `.env` to point at your running backend (e.g. `http://localhost:8000/api/v1`), then:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. Running tests

Backend Pest tests are planned but not yet part of this repository; API endpoints have been verified manually through **Bruno** during development.

---
