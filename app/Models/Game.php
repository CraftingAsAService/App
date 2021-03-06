<?php

namespace App\Models;

use App\Models\Translations\GameTranslation;
use Astrotomic\Translatable\Translatable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Illuminate\Database\Eloquent\Model;
use Watson\Rememberable\Rememberable;

class Game extends Model implements TranslatableContract
{

	protected $connection = 'caas';

	public $timestamps = false;

	use Translatable;

	public $translationModel = GameTranslation::class;
	public $translatedAttributes = [ 'name', 'description', 'abbreviation' ];
	// Always load the translations in when loading a entity
	// protected $with = ['translations'];

	protected $guarded = [];

	use Rememberable;

	public function scopeOrderByName($query, $direction = 'asc')
	{
		return $query->orderBySub(
			GameTranslation::select('name')
				// Use both the current and fallback locales for sorting
				->whereRaw('game_translations.locale in ("' . config('app.locale') . '", "' . config('app.fallback_locale') . '")')
				->whereRaw('game_translations.game_id = games.id')
				->orderByRaw('FIELD(game_translations.locale, "' . config('app.locale') . ',' . config('app.fallback_locale') . '")')
		, $direction);
	}

}
