<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser as PdfParser;
use Throwable;
use ZipArchive;

class ResumeTextExtractionService
{
    /**
     * Best-effort plaintext extraction from an uploaded resume. Returns null (not an
     * exception) on any failure — a bad/corrupt/encrypted file must never block the
     * upload itself; means keyword_score/tfidf_score stay 0.00 for that resume.
     */
    public function extract(string $absolutePath, string $extension): ?string
    {
        $extension = strtolower($extension);

        try {
            $text = match ($extension) {
                'pdf' => $this->extractPdf($absolutePath),
                'docx' => $this->extractDocx($absolutePath),
                'doc' => null,
                default => null,
            };
        } catch (Throwable $e) {
            Log::warning('Resume text extraction failed', [
                'path' => $absolutePath,
                'extension' => $extension,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        if (!$text || trim($text) === '') {
            return null;
        }

        // DBSchema note on resumes.extracted_text: "Lowercased text signature for
        // dictionary parsing" — normalize once here so MatchScoreService and any
        // future keyword tooling don't each re-derive it.
        return strtolower(trim(preg_replace('/\s+/', ' ', $text)));
    }

    protected function extractPdf(string $path): ?string
    {
        $parser = new PdfParser();
        $document = $parser->parseFile($path);

        return $document->getText();
    }

    protected function extractDocx(string $path): ?string
    {
        $zip = new ZipArchive();

        if ($zip->open($path) !== true) {
            return null;
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml === false) {
            return null;
        }

        // Turn paragraph closes into breaks before stripping tags so words don't
        // run together across paragraphs.
        $xml = str_replace('</w:p>', "\n", $xml);

        return strip_tags($xml);
    }
}
