<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Zones extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // A zone is a place you can go
        // Generally zones have coordinates
        Schema::create('zones', function (Blueprint $table) {
            $table->increments('id');

            $table->integer('zone_id')->unsigned()->nullable(); // Self FK - Parent Zone
        });

        Schema::create('zone_translations', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('zone_id')->unsigned(); // FK to items

            $table->string('locale')->index();

            $table->string('name');

            $table->unique(['zone_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        foreach (['zones', 'zone_translations'] as $table)
            Schema::dropIfExists($table);
    }
}