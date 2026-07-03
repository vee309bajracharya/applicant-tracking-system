<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\InviteUserRequest;
use App\Http\Requests\Admin\SetPasswordRequest;
use App\Http\Resources\UserDetailResource;
use App\Http\Resources\UserResource;
use App\Mail\InviteMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserManagementController extends Controller
{
    // non-candidate users list
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:active,inactive,pending,suspended'],
            'role' => ['nullable', 'in:admin,hr_manager,recruiter'],
        ]);
        $query = User::query()
            ->with('roles')
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'candidate');
            });

        // search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        $users = $query->latest()->paginate(10);

        return UserResource::collection($users)
            ->additional([
                'success' => true,
                'message' => 'Users list retrieved successfully',
            ]);

    }

    // single user details
    public function show(User $user): UserDetailResource
    {
        $user->load('roles');
        return (new UserDetailResource($user))
            ->additional([
                'success' => true,
                'message' => 'User details retrieved successfully',
            ]);
    }

    // invite HR Manager or Recruiter
    public function invite(InviteUserRequest $request): JsonResponse
    {
        //create user with 'pending' status, currently null password
        $user = User::create([
            'fullname' => $request->fullname,
            'email' => $request->email,
            'password' => null,
            'phone' => $request->phone,
            'status' => 'pending',
            'email_verified_at' => now(), // as staff invited by admin, email is considered verified
        ]);

        $user->assignRole($request->role);

        // generate 64-char invite token and cache for 24hr
        $inviteToken = bin2hex(random_bytes(32));
        $cacheKey = 'invite_token:' . $inviteToken;

        Cache::put($cacheKey, [
            'user_id' => $user->id
        ], now()->addHours(24)); // token valid for 24 hours

        $setPasswordUrl = config('app.frontend_url') . '/set-password?token=' . $inviteToken;

        Mail::to($user->email)->send(
            new InviteMail($user->fullname, $request->role, $inviteToken, $setPasswordUrl)
        );

        return response()->json([
            'success' => true,
            'message' => "Invitation sent to {$user->email}",
            'data' => [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $request->role,
                'status' => 'pending',
            ]
        ], 201);
    }

    // set password for invited staff (completing account setup)
    public function setPassword(SetPasswordRequest $request): JsonResponse
    {
        $cacheKey = 'invite_token:' . $request->invite_token;
        $cached = Cache::get($cacheKey);

        if (!$cached) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired invitation link',
            ], 422);
        }

        $user = User::findOrFail($cached['user_id']);

        if ($user->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Account already activated',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'status' => 'active',
        ]);

        Cache::forget($cacheKey);

        // issue token so user is logged in immediately after setup
        $token = $user->createToken('ats-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Password set successfully. Account is now actived.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'fullname' => $user->fullname,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first(),
                ],
            ],
        ], 200);
    }

    // suspend user
    public function suspend(User $user): JsonResponse
    {
        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot suspend an admin account',
            ], 403);
        }

        $user->update([
            'status' => 'suspended',
        ]);
        $user->tokens()->delete(); // force logout

        return response()->json([
            'success' => true,
            'message' => "User {$user->email} suspended",
        ]);
    }

    // activate user
    public function activate(User $user): JsonResponse
    {
        $user->update([
            'status' => 'active',
        ]);
        return response()->json([
            'success' => true,
            'message' => "User {$user->email} activated",
        ]);
    }

    // softdelete user
    public function destroy(User $user): JsonResponse
    {
        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete an admin account',
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete(); // softdelete

        return response()->json([
            'success' => true,
            'message' => "User {$user->email} removed",
        ]);
    }

}
