<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reports)
    {
    }

    public function hiring(Request $request)
    {
        return $this->respond($this->reports->hiringReport($request->user()), 'reports.hiring', 'jobs', 'hiring-report');
    }

    public function candidates(Request $request)
    {
        return $this->respond($this->reports->candidateSummary($request->user()), 'reports.candidates', 'candidates', 'candidate-summary');
    }

    public function interviews(Request $request)
    {
        return $this->respond($this->reports->interviewScoreSheet($request->user()), 'reports.interviews', 'interviews', 'interview-score-sheet');
    }

    protected function respond($data, string $view, string $viewKey, string $filename)
    {
        $pdf = Pdf::loadView($view, [
            $viewKey => $data,
            'generatedAt' => now()->format('Y-m-d'),
        ]);

        return $pdf->download($filename . '-' . now()->format('Y-m-d') . '.pdf');
    }


}
