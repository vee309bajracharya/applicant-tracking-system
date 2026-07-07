<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\AssignCompanyUserRequest;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyUserController extends Controller
{
    public function store(AssignCompanyUserRequest $request, Company $company): JsonResponse
    {
        $company->users()->syncWithoutDetaching([
            $request->user_id => [
                'designation' => $request->designation,
                'joined_at' => $request->joined_at,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User assigned to company',
        ], 200);
    }

    public function destroy(Company $company, User $user): JsonResponse
    {
        $detached = $company->users()->detach($user->id);

        if ($detached === 0) {
            return response()->json([
                'success' => false,
                'message' => 'User is not assigned to this company',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User unassigned from company',
        ], 200);
    }
}
