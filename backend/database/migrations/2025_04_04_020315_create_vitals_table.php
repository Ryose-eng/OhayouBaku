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
        Schema::create('vitals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('systolic');  // 最高血圧
            $table->integer('diastolic'); // 最低血圧
            $table->integer('pulse');     // 脈拍
            $table->decimal('temperature', 3, 1); // 体温（少数1桁）
            $table->integer('oxygen');    // O2濃度
            $table->enum('mood', ['happy', 'neutral', 'sad']); // 気分
            $table->text('note')->nullable(); // メモ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vitals');
    }
};
