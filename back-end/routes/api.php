<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Company\CompanyController;
use App\Http\Controllers\Company\CompanyUserController;
use App\Http\Controllers\Company\DepartmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

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

    // protected routes (requires Sanctum token)
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

        // Organization module (companies and departments)
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

    });

    // invited staff - set initial password (uses invite token and no sanctum requires)
    Route::post('/auth/set-password', [UserManagementController::class, 'setPassword'])->name('auth.set-password');
});