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
        Schema::create('early_visits', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('house_id');
            $table->foreign('house_id')->references('id')->on('houses')->onDelete('cascade');

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->date('visit_date');
            $table->time('visit_time');

            $table->string('description', 255)->nullable();

            $table->string('vehicle_plate')->nullable();

            $table->string('visitor_ci')->nullable();

            $table->integer('number_visitors');

            $table->string('type_visit');

            $table->boolean('pending')->default(false);

            $table->string('qr_code')->nullable();

            $table->time('approve_time')->nullable();

            $table->unsignedBigInteger('approved_by')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('early_visits');
    }
};
