/**
 * Craft Page
 */

'use strict';

Vue.component('ninja-map', require('../components/NinjaMap.vue').default);

const craft = new Vue({
	name: 'Crafting',
	el: '#craft',
	data: {
		// preferredRecipeIds: preferredRecipeIds,
		// givenItemIds: givenItemIds,
		quantities: quantities,
		breakdown: breakdown,
		items: items,
		// recipes: recipes,
		nodes: nodes,
		zones: zones,
		rewards: rewards,
		mobs: mobs,
		shops: shops,
		maps: maps,
	},
	created() {
		this.computeAmounts();
	},
	mounted() {
		this.$nextTick(() => {
			// // Fake a dynamic add
			// let markers = [
			// 	{
			// 		'id': 111,
			// 		'tooltip': 'Level 65 Rocky Outcrop',
			// 		'x': 20.4,
			// 		'y': 33.3,
			// 		'icon': '/assets/' + game.slug + '/map/icons/spearfishing.png'
			// 	},
			// 	{
			// 		'id': 77,
			// 		'tooltip': 'Level 65 Rocky Outcrop',
			// 		'x': 33.4,
			// 		'y': 15.3,
			// 		'icon': '/assets/' + game.slug + '/map/icons/mining.png'
			// 	}
			// ];

			// this.maps.push({
			// 	id: 222,
			// 	name: 'Central Shroud - Bentbranch',
			// 	src: '/assets/' + game.slug + '/m/r2f1/r2f1.00.jpg',
			// 	// Goes from 1,1 to 44,44 (as opposed to 0,0 to x,y)
			// 	//  anything less than 1,1 is unreachable
			// 	//  44,44 itself is unreachable
			// 	bounds: [[1, 1], [44, 44]],
			// 	markers: markers
			// })
		})
	},
	methods: {
		itemsAvailableRecipes:function() {
			var itemsAvailableRecipes = {};
			Object.keys(recipes).forEach(key => {
				if (typeof itemsAvailableRecipes[recipes[key]['item_id']] === 'undefined')
					itemsAvailableRecipes[recipes[key]['item_id']] = [];
				itemsAvailableRecipes[recipes[key]['item_id']].push(key);
			});
			return itemsAvailableRecipes;
		},
		computeAmounts:function() {
			// We want these items: givenItemIds
			// If any of them can be recipe'd, do it, otherwise it'll have to come from a drop
			this.topTierCrafts = {};
			this.itemsToGather = {};

			// Prefer to gather items in this order
			var preferredHandleOrder = ['recipes', 'everythingElse'],//nodes', 'shops'],
				itemsAvailableRecipes = this.itemsAvailableRecipes();

			for (var id of givenItemIds)
			{
				// TODO TICKETME - there's an opportunity to have a preferredHandleOrder on a per item ID basis
				// This loop is broken out of when the answer is hit
				for (var method of preferredHandleOrder)
				{
					if (method == 'recipes' && typeof itemsAvailableRecipes[id] !== 'undefined')
					{
						var recipeId = itemsAvailableRecipes[id][0];
						if (itemsAvailableRecipes[id].length > 1)
						{
							for (var recipeIdCheck of itemsAvailableRecipes[id])
							{
								if (preferredRecipeIds.contains(recipeIdCheck))
								{
									recipeId = recipeIdCheck;
									break;
								}
							}
						}
						this.topTierCrafts[recipeId] = this.dataTemplate(recipeId, quantities[id]);
						break;
					}
					else
					{
						this.itemsToGather[id] = this.dataTemplate(id, quantities[id]);
						break;
					}
				}
			}

			Object.getOwnPropertyNames(this.topTierCrafts).forEach(id => {
				this.craftRecipe(id);
			});

			console.log(this.topTierCrafts, this.itemsToGather);
		},
		dataTemplate:function(id, quantity) {
			return {
				'id': id,
				'amountHave': 0, // How many you physically have
				'amountNeeded': 0, // How many you currently need (minus completed recipes)
				'amountRequired': quantity, // How many you need in absolute total (including completed recipes)
			};
		},
		craftRecipe:function(id) {
			console.log(id, this.topTierCrafts[id], recipes[id]);

		}
	}
});
