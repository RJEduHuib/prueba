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
        Schema::create('houses', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('complex_id');
            $table->foreign('complex_id')->references('id')->on('complexes')->onDelete('cascade');

            $table->string('number_house');

            $table->string('owner_name');
            $table->string('owner_surname');
            $table->string('owner_email');
            $table->string('owner_phone');
            $table->string('owner_phone_2')->nullable();
            $table->string('plates')->nullable();
            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('houses');
    }
};
