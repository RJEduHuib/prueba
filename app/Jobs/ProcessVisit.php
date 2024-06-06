<?php

namespace App\Jobs;

use App\Mail\EmailNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class ProcessVisit implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public mixed $number;
    public mixed $message;
    public mixed $payload;

    /**
     * Create a new job instance.
     */
    public function __construct(
         $number,
         $message,
         $payload = null
    ) {
        $this->number = $number;
        $this->message = $message;
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

        $emails = explode(',', $this->payload['complex_emails']);

        $emails[] = $this->payload['owner']['owner_email'];

        //Send Email Notification
        Mail::to($emails)
            ->send(new EmailNotification($this->payload, $path));

        //Send WhatsApp Notification
        Http::post(env('WHATSAPP_API_URL'), [
            'number' => $this->number,
            'message' => $this->message,
        ]);

        Http::post(env('WHATSAPP_API_URL'), [
            'number' => $this->number,
            'message' => Storage::disk('r2')->url($path),
        ]);
    }
}
