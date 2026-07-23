<?php

namespace App\Http\Controllers\Faq;

use App\Http\Controllers\Controller;
use App\Http\Requests\Faq\StoreFaqQuestionRequest;
use App\Http\Requests\Faq\UpdateFaqQuestionRequest;
use App\Http\Resources\FaqQuestionResource;
use App\Models\FaqQuestion;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $query = FaqQuestion::query();

        $canManage = $request->user()->can('faq.manage');

        if (!$canManage) {
            $query->where('is_active', true);
        } elseif ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($category = $request->query('category'))
            $query->where('category', $category);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%");
            });
        }
        return FaqQuestionResource::collection($query->latest()->paginate(10));
    }

    public function store(StoreFaqQuestionRequest $request)
    {
        $faq = FaqQuestion::create($request->validated());

        return FaqQuestionResource::make($faq)->response()->setStatusCode(201);
    }

    public function update(UpdateFaqQuestionRequest $request, FaqQuestion $faq)
    {
        $faq->update($request->validated());

        return FaqQuestionResource::make($faq->fresh());
    }

    public function destroy(FaqQuestion $faq)
    {
        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'FAQ entry deleted successfully',
        ], 200);
    }
}
