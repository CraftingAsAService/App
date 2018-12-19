<?php

namespace Tests\Unit;

use App\Models\Game\Aspects\Category;
use App\Models\Game\Aspects\Item;
use App\Http\Resources\Json\Items as ItemsCollection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemTest extends TestCase
{

	/**
	 * Initialise classes to test against.
	 *
	 * @return	void
	 */
	public function setUp()
	{
		parent::setUp();

		$this->setGame();
	}

	/** @test */
	function item_json_response_is_valid()
	{

	}

	/** @test */
	function item_json_response_contains_valid_category_name()
	{
		// Arrange
		$item = factory(Item::class)->create([
			'name' => 'Beta Item',
		]);
		$category = factory(Category::class)->create([
			'name' => 'Gamma Category',
		]);
		$item->category()->associate($category);
		$item->save();

		$items = Item::with('category')->get();

		// Act
		$ic = new ItemsCollection($items);

		// Assert
		$this->assertEquals('Gamma Category', $ic->first()->category->name);
	}

	/** @test */
	function items_can_be_filtered_by_name()
	{

	}

	/** @test */
	function items_can_be_filtered_by_ilvl()
	{

	}

	// TODO, more items_can_be_filtered_by_...

	/** @test */
	function items_can_be_sorted_by_name()
	{

	}

	/** @test */
	function items_can_be_sorted_by_ilvl()
	{

	}

	// TODO, more items_can_be_sorted_by_...

}