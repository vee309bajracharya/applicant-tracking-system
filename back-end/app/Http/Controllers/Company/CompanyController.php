<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Http\Resources\CompanyDetailResource;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $companies = Company::query()
            ->withCount(['departments','users'])
            ->latest()
            ->paginate(10);

        return CompanyResource::collection($companies)
            ->additional([
                'success' => true,
                'message' => 'Companies retrieved successfully',
            ]);
    }

    public function show(Company $company): CompanyDetailResource
    {
        $company->load([
            'departments',
            'users'
        ]);

        return (new CompanyDetailResource($company))
            ->additional([
                'success' => true,
                'message' => 'Company details retrieved successfully',
            ]);
    }

    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $data = $request->safe()->except('logo');
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('logos', 'public');
            // TODO: pipe through Intervention Image resize before store — not wired here
        }

        $company = Company::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Company created successfully',
            'data' => new CompanyResource($company),
        ], 201);
    }

    public function update(UpdateCompanyRequest $request, Company $company): JsonResponse
    {
        $data = $request->safe()->except('logo');

        $oldLogo = $company->logo;

        if ($request->hasFile('logo')) {

            $data['logo'] = $request
                ->file('logo')
                ->store('logos', 'public');

            // TODO: Resize using Intervention Image.
        }

        $company->update($data);
        if ($request->hasFile('logo') && $oldLogo) {
            Storage::disk('public')->delete($oldLogo);
        }

        $company->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Company updated successfully',
            'data' => new CompanyResource($company),
        ]);
    }

    public function destroy(Company $company): JsonResponse
    {
        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
        }

        $company->delete();

        return response()->json([
            'success' => true,
            'message' => "{$company->company_name} Company removed",
        ]);
    }
}
