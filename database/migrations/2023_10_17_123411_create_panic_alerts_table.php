<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('panic_alerts', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('complex_id');
            $table->foreign('complex_id')->references('id')->on('complexes');

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users');

            $table->time('time_alerted');
            $table->date('date_alerted');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('panic_alerts');
    }
};
