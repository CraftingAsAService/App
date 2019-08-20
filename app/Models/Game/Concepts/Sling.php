<?php

namespace App\Models\Game\Concepts;

use App\Models\Game\Aspects\Item;
use App\Models\Game\Aspects\Node;
use App\Models\Game\Aspects\Objective;
use App\Models\Game\Aspects\Recipe;
use App\Models\Game\Concepts\Scroll;

class Sling {

	protected $scroll;

	public function __construct()
	{
		$this->get();
	}

	static public function parseCookie()
	{
		$ninjaCart = isset($_COOKIE['NinjaCart']) && $_COOKIE['NinjaCart']
			? json_decode($_COOKIE['NinjaCart'])
			: [];

		foreach ($ninjaCart as &$entry)
		{
			$original = $entry;

			if ($entry->t == 'item')
				$entry = Item::with('translations')->whereId($entry->i)->first()->toArray();

			$entry['type'] = $original->t;
			$entry['quantity'] = $original->q;
		}

		return collect($ninjaCart);
	}

	static public function unsetCookie()
	{
		setcookie('NinjaCart', '', time() - 3600);
	}

	public function get()
	{
		// Get the active scroll, create one if it does not exist
		$this->scroll = Scroll::active()->firstOrCreate([
			'user_id' => auth()->user()->id,
		]);
	}

	/**
	 * Change User's Active Scroll
	 * @param  integer $id       ID of the Entity
	 * @param  string $type     Type of the Entity, Singular word expected
	 * @param  integer $quantity Amount to add, subtract; false will delete
	 */
	public function change($id, $type, $quantity = 1)
	{
		// Find the entity we're trying to add or update
		$entityClass = 'App\\Models\\Game\\Aspects\\' . ucwords($type);
		$entity = $entityClass::find($id);

		if (is_null($entity))
			return;

		$relation = str_plural($type);

		// Quantity is set to false: Delete
		if ($quantity === false)
			return $this->scroll->$relation()->detach($entity);

		// Attach or update the entity
		if ( ! $this->scroll->$relation->contains($entity))
			// Entry does not yet exist: Create
			return $this->scroll->$relation()->attach($entity, [ 'quantity' => $quantity ]);

		// Entry already exists
		$updatedQuantity = $this->scroll->$relation->find($entity->id)->pivot->quantity + $quantity;

		// New quantity is not valid: Delete
		if ($updatedQuantity <= 0)
			return $this->scroll->$relation()->detach($entity);

		// New quantity is valid: Update
		return $this->scroll->$relation()->updateExistingPivot($entity, [
			'quantity' => $updatedQuantity
		]);
	}

	public function remove($id, $type)
	{
		return $this->change($id, $type, false);
	}

	public function truncate()
	{
		foreach (Scroll::$polymorphicRelationships as $relation)
			foreach ($this->scroll->$relation as $entity)
				$this->remove($entity->id, $entity->pivot->jotting_type);
	}

	public function compressToString()
	{
		$this->scroll->fresh();

		$shorthand = [];

		foreach (Scroll::$polymorphicRelationships as $letter => $rel)
		{
			if ($this->scroll->$rel->count() == 0)
				continue;

			$entries = [];
			foreach ($this->scroll->$rel as $entry)
				$entries[] = $entry->id . ($entry->pivot->quantity > 1 ? 'x' . $entry->pivot->quantity : '');

			$shorthand[] = $letter . ':' . implode(',', $entries);
		}

		return base64_encode(implode('|', $shorthand));
	}

	public function importFromString($string)
	{
		$string = base64_decode($string);

		foreach (explode('|', $string) as $r)
		{
			list($letter, $entries) = explode(':', $r);
			$entries = explode(',', $entries);

			// $entries are "$id" or a spaceless "$id x $qty"
			foreach ($entries as $id)
			{
				$qty = 1;
				if (preg_match('/x/', $id))
					list($id, $qty) = explode('x', $id);

				self::change($id, str_singular(Scroll::$polymorphicRelationships[$letter]), $qty);
			}
		}
	}

}