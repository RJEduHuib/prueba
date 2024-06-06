<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Supervisor/Index');
    }
}
