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
        Schema::create('visits', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users');

            $table->date('visit_date');
            $table->time('visit_time');

            $table->string('description', 255)->nullable();

            $table->string('visit_images')->nullable();
            $table->string('original_visit_images')->nullable();

             $table->string('vehicle_plate')->nullable();

            $table->string('visitor_id')->nullable();

            $table->integer('number_visitors');

            $table->string('type_visit');

            $table->string('file_id')->nullable();

            $table->unsignedBigInteger('house_id');
            $table->foreign('house_id')->references('id')->on('houses');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
