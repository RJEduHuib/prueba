<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class ProcessVisitNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $number;
    public $message;
    public $payload;

    public function __construct($number, $message, $payload = null)
    {
        $this->number = $number;
        $this->message = $message;
        $this->payload = $payload;
    }

    public function handle(): void
    {
        /*
        Http::post('https://messaging.sjbdevsoftcloud.com/api/whatsapp/send-message', [
            'number' => $this->number,
            'message' =>  $this->message,
            'payload' => $this->payload
        ]);
        */
        /*
              $client = new \GuzzleHttp\Client(['verify' => false]);


              $client->request('POST', 'https://messaging.sjbdevsoftcloud.com/api/whatsapp/send-message', [
                  'json' => [
                      'number' => $this->number,
                      'message' => $this->message,
                      'payload' => $this->payload
                  ],
              ]);

        $client->request('POST', 'http://127.0.0.1:8002/api/whatsapp/send-message', [
            'json' => [
                'number' => $this->number,
                'message' => $this->message,
                'payload' => $this->payload
            ],
        ]);   */

        Http::post('http://127.0.0.1:8002/api/whatsapp/send-message', [
            'number' => $this->number,
            'message' =>  $this->message,
            'payload' => $this->payload
        ]);
    }
}
