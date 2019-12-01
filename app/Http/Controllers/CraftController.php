<?php

namespace App\Http\Controllers;

use App\Models\Game\Aspects\Item;
use App\Models\Game\Aspects\Recipe;
use App\Models\Game\Concepts\Map;
use App\Models\Game\Concepts\Sling;
use Illuminate\Http\Request;

class CraftController extends Controller
{

	public function index()
	{
		$cookieContents = Sling::parseCookie();

		if ($cookieContents->isEmpty())
			return redirect('sling');

		// If the user had these items marked as a recipe, pre-select it as a recipe
		$recipes = $cookieContents->filter(function($row) {
			return $row['type'] == 'recipe';
		});
		$preferredRecipeIds = $recipes->pluck('id');

		// Users can add items themselves
		//  AND obviously recipes produce items
		$quantities = $cookieContents->mapWithKeys(function($row) {
			if ($row['type'] == 'recipe')
				return [ $row['item_id'] => $row['quantity'] ];
			if ($row['type'] == 'item')
				return [ $row['id'] => $row['quantity'] ];
			return [ '' => null ];
		})->diff([null]);

		$givenItemIds = $quantities->keys();

		// If it's not a digit, or a comma, take it out.
		//  Custom XSS/etc prevention
		$givenItemIdsSearch = preg_replace('/[^\d,]/', '', $givenItemIds->implode(','));

		$results = collect(\DB::select(
			'WITH RECURSIVE cte AS (' .
				'SELECT rr.recipe_id, rr.item_id ' .
				'FROM recipes r ' .
				'JOIN item_recipe rr ON rr.recipe_id = r.id ' .
				'WHERE r.item_id IN ( ' . $givenItemIdsSearch . ') ' .
				'UNION ALL ' .
				'SELECT rr.recipe_id, rr.item_id ' .
				'FROM recipes r ' .
				'JOIN item_recipe rr ON rr.recipe_id = r.id ' .
				'JOIN cte ON cte.item_id = r.item_id ' .
			') SELECT recipe_id, item_id FROM cte;'
		));

		$recipeIds = $results->pluck('recipe_id')->unique();
		$itemIds = $results->pluck('item_id')
			->unique()
			// Doing things in this order allows the user to manually add and look for Crystals/etc
			->diff(config('game.reagentsToIgnore')) // Take out Crystals/etc, anything not worth accounting for
			->merge($givenItemIds); // Add in what was originally searched upon

		$recipes = Recipe::whereIn('id', $recipeIds)
			->get()
			->keyBy('id');

		$items = Item::with(
				'nodes', // Gathering drops
					'nodes.zones',
				'mobs', // Mob drops
					'mobs.zones',
				'repeatablyRewardedFrom', // Objective drops
					'repeatablyRewardedFrom.zones',
				'shops',
					'shops.zones',
				'zones', // Treasure drops
				'prices',
			)
			->whereIn('id', $itemIds)
			->get()
			->keyBy('id');

		// Break down item availability by zone

		// Globalizing zones temporarily; works better in the mapWithKeys functions
		$this->zones = $items->pluck('zones')->flatten()->keyBy('id');

		$rewards = $items->pluck('repeatablyRewardedFrom')->flatten()->keyBy('id')->mapWithKeys(function($entry) {
			$this->zones = $this->zones->merge($entry->zones);
			return [$entry->id => [
				'id'    => $entry->id,
				'level' => $entry->level,
				'icon'  => $entry->icon,
				'name'  => $entry->name,
			]];
		});

		$mobs = $items->pluck('mobs')->flatten()->keyBy('id')->mapWithKeys(function($entry) {
			$this->zones = $this->zones->merge($entry->zones);
			return [$entry->id => [
				'id'    => $entry->id,
				'level' => $entry->level,
				'name'  => $entry->name,
			]];
		});

		$nodes = $items->pluck('nodes')->flatten()->keyBy('id')->mapWithKeys(function($entry) {
			$this->zones = $this->zones->merge($entry->zones);
			return [$entry->id => [
				'id'    => $entry->id,
				'level' => $entry->level,
				'type'  => $entry->type,
				'name'  => $entry->name,
			]];
		});

		$shops = $items->pluck('shops')->flatten()->keyBy('id')->mapWithKeys(function($entry) {
			$this->zones = $this->zones->merge($entry->zones);
			return [$entry->id => [
				'id'    => $entry->id,
				'level' => $entry->level,
				'type'  => $entry->type,
				'name'  => $entry->name,
			]];
		});

		$zones = $this->zones->keyBy('id');
		unset($this->zones);

		$relevantMaps = Map::with('detail')
			->whereIn('zone_id', $zones->pluck('id'))
			->get();

		$maps = [];
		foreach ($relevantMaps as $map)
		{
			if ( ! isset($maps[$map->zone_id]))
				$maps[$map->zone_id] = [];
			$maps[$map->zone_id][] = array_merge($map->detail->data, [ 'image' => $map->image ]);
		}

		$loopVars = [
			// $item->$key => 'shorthandKey'
			'nodes' => 'nodes',
			'mobs' => 'mobs',
			'shops' => 'shops',
			'repeatablyRewardedFrom' => 'rewards',
		];

		$breakdown = [
			// ZoneID => [
			// 	 ItemID => [
			// 	   'nodes' => [
			// 	     NodeID => [ Coordinate Data ],
			// 	   ],
			// 	   'shops' => [],
			// 	   'rewards' => [],
			// 	   'mobs' => [],
			// 	   'treasure' => [],
			// 	 ]
			// ]
		];
		foreach ($items as $item)
		{
			foreach ($loopVars as $key => $slug)
				foreach ($item->$key as $var)
					foreach ($var->zones as $zone)
						$breakdown[$zone->id][$item->id][$slug][$var->id] = [
							'x'      => $zone->pivot->x,
							'y'      => $zone->pivot->y,
							'radius' => $zone->pivot->radius,
						];

			foreach ($item->zones as $zone)
				$breakdown[$zone->id][$item->id]['treasure'][] = [
					'x'      => $zone->pivot->x,
					'y'      => $zone->pivot->y,
					'radius' => $zone->pivot->radius,
				];
		}

		// Zone with the most items goes first
		$breakdown = collect($breakdown)->sortByDesc(function($entries) {
			return count($entries);
		});

		return view('game.craft', compact('preferredRecipeIds', 'givenItemIds', 'quantities', 'breakdown', 'items', 'recipes', 'nodes', 'zones', 'rewards', 'mobs', 'shops', 'maps'));
	}


}
