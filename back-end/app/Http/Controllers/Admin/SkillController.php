<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSkillRequest;
use App\Http\Requests\Admin\UpdateSkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $query = Skill::query();

        if ($search = $request->query('search')) {
            $query->where('skill_name', 'like', "%{$search}%");
        }

        return SkillResource::collection($query->paginate(10));
    }

    public function store(StoreSkillRequest $request)
    {
        $skill = Skill::create($request->validated());

        return SkillResource::make($skill)->response()->setStatusCode(201);
    }

    public function update(UpdateSkillRequest $request, Skill $skill)
    {
        $skill->update($request->validated());

        return SkillResource::make($skill);
    }

    public function destroy(Skill $skill)
    {
        $skill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Skill deleted.'
        ], 200);
    }
}
