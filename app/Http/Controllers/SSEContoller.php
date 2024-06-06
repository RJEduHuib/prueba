<?php

namespace App\Http\Controllers;

use App\Models\SSEEvents;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SSEContoller extends Controller
{
    public function stream() 
    {
        //Set headers
        $headers = [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ];

        $response = new StreamedResponse(function() {
            while(true) {
            $last_event = SSEEvents::where('is_delivered', false)->orderBy('created_at', 'desc')->first();

            if ($last_event) {
                $last_event->is_delivered = true;
                $last_event->save();

                echo "event: {$last_event->event}\n";
                echo "type: {$last_event->type}\n";
                echo "message: {$last_event->message}\n";
                echo "images: {$last_event->images}\n\n";
            }

            ob_flush();
            flush();

            sleep(1);
            }
        }, 200, $headers);

        //Return response
        return $response;
    }

    public function send_event(Request $request)
    {
        $event = SSEEvents::create([
            'event' => $request->event,
            'type' => $request->type,
            'message' => $request->message,
            'images' => $request->images,
            'is_delivered' => false,
        ]);

        return response()->json([
            'message' => 'Event sent successfully',
            'event' => $event,
        ]);
    }
}
