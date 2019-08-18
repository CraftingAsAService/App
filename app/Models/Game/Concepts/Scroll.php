<?php

namespace App\Models\Game\Concepts;

use App\Models\Game\Aspects\Item;
use App\Models\Game\Aspects\Job;
use App\Models\Game\Aspects\Node;
use App\Models\Game\Aspects\Objective;
use App\Models\Game\Aspects\Recipe;
use App\Models\Game\Concept;
use App\Models\Game\Concepts\Scroll\Vote;
use App\Models\Game\Concepts\Report;
use App\Models\Translations\ScrollTranslation;
use App\Models\User;
use Carbon\Carbon;
use Astrotomic\Translatable\Translatable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;

class Scroll extends Concept implements TranslatableContract
{

	use Translatable;

	public $translationModel = ScrollTranslation::class;
	public $translatedAttributes = [ 'name', 'description' ];

	public $timestamps = true;

	public static $polymorphicRelationships = [
		'i' => 'items',
		'o' => 'objectives',
		'r' => 'recipes',
		'n' => 'nodes',
	];

	// public static function boot()
	// {
	// 	parent::boot();

	// 	// Auto assign the user_id to the auth user
	// 	static::creating(function ($model) {
	// 		dd($model);
	// 		$model->user_id = auth()->user()->id;
	// 	});
	// }

	/**
	 * Scopes
	 */

	public function scopeFilter($query, $filters)
	{
		if (isset($filters['bauthor']) && preg_match('/author:(\d+)/', $filters['bauthor'], $authorMatch))
			$query->where('user_id', User::decodeId($authorMatch[1]));

		if (isset($filters['bclass']))
			$query->whereIn('job_id', is_array($filters['bclass']) ? $filters['bclass'] : explode(',', $filters['bclass']));

		if (isset($filters['min_level']))
			$query->where('min_level', '<=', $filters['min_level']);

		if (isset($filters['max_level']))
			$query->where('max_level', '>=', $filters['max_level']);

		return $query;
	}

	public function scopeAuthoredByUser($query, $userId = null)
	{
		if ( ! $userId && ! auth()->check())
			return $query;

		return $query->where('user_id', $userId ?? auth()->user()->id);
	}

	/**
	 * Relationships
	 */

	public function job()
	{
		return $this->belongsTo(Job::class)->withTranslation();
	}

	public function votes()
	{
		return $this->hasMany(Vote::class);
	}

	public function myVote()
	{
		return $this->hasMany(Vote::class)->byUser();
	}

	public function author()
	{
		return $this->belongsTo(User::class);
	}

	public function jottings()
	{
		return $this->morphTo();
	}

	public function items()
	{
		return $this->morphedByMany(Item::class, 'jotting')->withTranslation()->withPivot('quantity');
	}

	public function objectives()
	{
		return $this->morphedByMany(Objective::class, 'jotting')->withTranslation()->withPivot('quantity');
	}

	public function recipes()
	{
		return $this->morphedByMany(Recipe::class, 'jotting')->withTranslation()->withPivot('quantity');
	}

	public function nodes()
	{
		return $this->morphedByMany(Node::class, 'jotting')->withTranslation()->withPivot('quantity');
	}

	public function reports()
	{
		return $this->morphMany(Report::class, 'reportable');
	}

}