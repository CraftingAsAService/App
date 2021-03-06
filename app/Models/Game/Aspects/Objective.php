<?php

namespace App\Models\Game\Aspects;

use App\Models\Game\Aspect;
use App\Models\Game\Aspects\Item;
use App\Models\Game\Aspects\Job;
use App\Models\Game\Aspects\Npc;
use App\Models\Game\Aspects\Zone;
use App\Models\Game\Concepts\Detail;
use App\Models\Game\Concepts\Scroll;
use App\Models\Game\Concepts\Niche;
use App\Models\Translations\ObjectiveTranslation;

class Objective extends Aspect
{

	public $translationModel = ObjectiveTranslation::class;
	public $translatedAttributes = [ 'name', 'description' ];

	/**
	 * Mutators and Accessors
	 */

	public function getIconAttribute($icon)
	{
		// Icon is likely a five digit number, or less. 12345
		//  Icons are stored in a folder structure based on six digits, with only the first 3 mattering. (12345 == 012000)
		$icon = str_pad($icon, 6, "0", STR_PAD_LEFT);
		$folder = substr($icon, 0, 3) . "000";
		return $folder . '/' . $icon;
	}

	/**
	 * Relationships
	 */

	public function detail()
	{
		return $this->morphOne(Detail::class, 'detailable');
	}

	public function zones()
	{
		return $this->morphToMany(Zone::class, 'coordinate')->withTranslation()->withPivot('x', 'y', 'z', 'radius');
	}

	public function scrolls()
	{
		return $this->morphToMany(Scroll::class, 'jotting')->withTranslation()->withPivot('quantity');
	}

	public function rewards()
	{
		return $this->belongsToMany(Item::class)->withTranslation()->withPivot('reward', 'quantity', 'quality', 'rate')->wherePivot('reward', true);
	}

	public function requirements()
	{
		return $this->belongsToMany(Item::class)->withTranslation()->withPivot('reward', 'quantity', 'quality', 'rate')->wherePivot('reward', false);
	}

	public function issuer()
	{
		return $this->belongsTo(Npc::class, 'issuer_id')->withTranslation();
	}

	public function target()
	{
		return $this->belongsTo(Npc::class, 'target_id')->withTranslation();
	}

	public function niche()
	{
		return $this->belongsTo(Niche::class);
	}

}
