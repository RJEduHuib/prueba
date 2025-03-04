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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('complex_id');
            $table->foreign('complex_id')->references('id')->on('complexes')->onDelete('cascade');

            $table->string('direction_ip');

            $table->boolean('is_active')->default(true);

            $table->integer('cameras_number')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
