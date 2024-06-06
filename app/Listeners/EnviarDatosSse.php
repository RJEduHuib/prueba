<?php

namespace App\Listeners;

use App\Events\DatosEvent;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class EnviarDatosSse implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(DatosEvent $event)
    {
        return response()->sse()->setCallback(function() use ($event) {
            $datos = $event->datos;

            echo "data:" . json_encode($datos) . "\n\n";

            ob_flush();
            flush();
        });
    }
}
