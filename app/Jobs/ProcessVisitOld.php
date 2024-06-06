<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ProcessVisitOld implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public mixed $payload;

    /**
     * Create a new job instance.
     */
    public function __construct($payload)
    {
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $pdf = Pdf::loadView('pdfs.index',  [
            'payload' => $this->payload,
            'title' => 'Bitaldata - Reporte de Visita | ' . $this->payload['hash'],
        ]);

        $pdf_content = $pdf->stream();

        $path = 'visits/' . $this->payload['hash'] . '.pdf';

        //Save PDF to CloudFlare R2 Bucket
        Storage::disk('r2')->put($path, $pdf_content);
    }
}
