<?php

use App\Http\Controllers\Admin\SkillController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Candidate\CandidateProfileController;
use App\Http\Controllers\Candidate\CandidateSkillController;
use App\Http\Controllers\Candidate\ResumeController;
use App\Http\Controllers\Company\CompanyController;
use App\Http\Controllers\Company\CompanyUserController;
use App\Http\Controllers\Company\DepartmentController;
use FontLib\Table\Type\name;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Phase 1(P1) : Authentication and Authorization 
    // public auth
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login', [AuthController::class, 'login'])->name('login');

        // email verification for candidate OTP flow
        Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->name('verify-email');
        Route::post('/resend-verification-otp', [AuthController::class, 'resendVerificationOtp'])->name('resend-verification-otp');

        //password reset - 3 step OTP flow
        Route::prefix('password')->name('password.')->group(function () {
            Route::post('/forgot', [PasswordResetController::class, 'sendOtp'])->name('forgot');
            Route::post('/verify', [PasswordResetController::class, 'verifyOtp'])->name('verify');
            Route::post('/reset', [PasswordResetController::class, 'resetPassword'])->name('reset');
        });

        // OAuth for candidates only
        Route::prefix('oauth')->name('oauth.')->group(function () {
            Route::post('/{provider}/redirect', [OAuthController::class, 'redirect'])->name('redirect');
            Route::post('/{provider}/callback', [OAuthController::class, 'callback'])->name('callback');
        });
    });

    // P1: protected routes (requires Sanctum token)
    Route::middleware(['auth:sanctum'])->group(function () {

        // auth utils
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('/me', [AuthController::class, 'me'])->name('me');
        });

        // user mgmt by admin
        Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
            Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
            Route::get('/users/{user}', [UserManagementController::class, 'show'])->name('users.show');
            Route::post('/invite', [UserManagementController::class, 'invite'])->name('invite');
            Route::patch('/users/{user}/suspend', [UserManagementController::class, 'suspend'])->name('users.suspend');
            Route::patch('/users/{user}/activate', [UserManagementController::class, 'activate'])->name('users.activate');
            Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
        });

        // Phase 2: Organization module (companies and departments)
        Route::prefix('companies')->name('companies.')->middleware('permission:companies.manage')->group(function () {
            Route::get('/', [CompanyController::class, 'index'])->name('index');
            Route::get('/{company}', [CompanyController::class, 'show'])->name('show');
            Route::post('/', [CompanyController::class, 'store'])->name('store');
            Route::patch('/{company}', [CompanyController::class, 'update'])->name('update');
            Route::delete('/{company}', [CompanyController::class, 'destroy'])->name('destroy');
            Route::post('/{company}/users', [CompanyUserController::class, 'store'])->name('users.store');
            Route::delete('/{company}/users/{user}', [CompanyUserController::class, 'destroy'])->name('users.destroy');

            // read —> admin + hr_manager
            Route::middleware('permission:departments.view')->group(function () {
                Route::get('/{company}/departments', [DepartmentController::class, 'index'])->name('index');
            });
        });

        Route::prefix('departments')->name('departments.')->group(function () {

            // write — admin only
            Route::middleware('permission:departments.manage')->group(function () {
                Route::post('/', [DepartmentController::class, 'store'])->name('store');
                Route::patch('/{department}', [DepartmentController::class, 'update'])->name('update');
                Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('destroy');
            });
        });

        //Phase 3: Candidate and Competency Layer

        Route::prefix('candidate')->name('candidate.')->middleware('role:candidate')->group(function () {

            // candidate self-service - own profile only
            Route::get('/profile', [CandidateProfileController::class, 'show'])->name('profile.show');
            Route::post('/profile', [CandidateProfileController::class, 'store'])->name('profile.store');
            Route::patch('/profile', [CandidateProfileController::class, 'update'])->name('profile.update');

            // resume upload
            Route::get('/resumes', [ResumeController::class, 'index'])->name('resumes.index');
            Route::post('/resumes', [ResumeController::class, 'store'])->name('resumes.store');
            Route::delete('/resumes/{resume}', [ResumeController::class, 'destroy'])->name('resumes.destroy');

            // skills attach
            Route::get('/skills', [CandidateSkillController::class, 'index'])->name('skills.index');
            Route::post('/skills', [CandidateSkillController::class, 'store'])->name('skills.store');
            Route::patch('/skills/{skill}', [CandidateSkillController::class, 'update'])->name('skills.update');
            Route::delete('/skills/{skill}', [CandidateSkillController::class, 'destroy'])->name('skills.destroy');
        });

        // resume download - owner candidate OR HR/Recruiter with resumes.view
        Route::get('/resumes/{resume}/download', [ResumeController::class, 'download'])->name('resumes.download');

        // HR + recruiter browse candidate profiles
        Route::get('/candidates', [CandidateProfileController::class, 'index'])->middleware('permission:candidates.view')->name('candidates.index');

        // admin master skill taxonomy CRUD
        Route::prefix('skills')->name('skills.')->middleware('permission:skills.manage')->group(function () {
            Route::get('/', [SkillController::class, 'index'])->name('index');
            Route::post('/', [SkillController::class, 'store'])->name('store');
            Route::patch('/{skill}', [SkillController::class, 'update'])->name('update');
            Route::delete('/{skill}', [SkillController::class, 'destroy'])->name('destroy');
        });

    });

    // invited staff - set initial password (uses invite token and no sanctum requires)
    Route::post('/auth/set-password', [UserManagementController::class, 'setPassword'])->name('auth.set-password');
});