// https://austincooper.dev/2019/08/09/vue-observable-state-store/
const state = Vue.observable({
	items: {},
	recipes: {},
	itemZonePreferences: {},
	itemJobTierPreferences: {},
});

export const getters = {
	items: () => state.items,
	itemZonePreferences: () => state.itemZonePreferences,
	recipes: () => state.recipes,
	itemJobTierPreferences: () => state.itemJobTierPreferences,
};

export const mutations = {
	setItemData: (itemId, need, have, required) => state.items[itemId] = {
			have:     have || 0,
			required: required || 0
		},
	setItemHaveAmount: (itemId, haveAmount) => state.items[itemId].have = haveAmount,
	setItemRequiredAmount: (itemId, requiredAmount) => state.items[itemId].required = requiredAmount,
	increaseItemRequiredAmount: (itemId, requiredAmount) => state.items[itemId].required += requiredAmount,

	setRecipeData: (recipeId, need, have, required) => state.recipes[recipeId] = {
			have:     have || 0,
			required: required || 0
		},
	setRecipeHaveAmount: (recipeId, haveAmount) => state.recipes[recipeId].have = haveAmount,
	setRecipeRequiredAmount: (recipeId, requiredAmount) => state.recipes[recipeId].required = requiredAmount,
	increaseRecipeRequiredAmount: (recipeId, requiredAmount) => state.recipes[recipeId].required += requiredAmount,

	setItemZonePreference: (itemId, zoneId) => state.itemZonePreferences[itemId] = zoneId,
	setItemJobTierPreference: (itemId, jobId, tierId) => state.itemJobTierPreferences[itemId] = jobId + '-' + tierId,
}

export const actions = {
	fcfsItemZonePreference: (itemId, zoneId) => {
		// First Come, First Serve the Item-Zone Preference
		if (typeof state.itemZonePreferences[itemId] !== 'undefined')
			return state.itemZonePreferences[itemId] == zoneId;

		mutations.setItemZonePreference(itemId, zoneId);
		return true;
	},
	fcfsItemJobTierPreference: (itemId, jobId, tierId) => {
		// First Come, First Serve the Recipe-Job Preference
		if (typeof state.itemJobTierPreferences[itemId] !== 'undefined')
			return state.itemJobTierPreferences[itemId] == jobId + '-' + tierId;

		mutations.setItemJobTierPreference(itemId, jobId, tierId);
		return true;
	},
}

// export const mutators = {
// 	firstComeFirstServeItemToZone:function(itemId, zoneId) {
// 		if (typeof store.activeItemZones[itemId] === 'undefined')
// 			mutators.setItemToZone(itemId, zoneId);
// 	},
// 	setItemToZone:function(itemId, zoneId) {
// 		store.activeItemZones[itemId] = zoneId;
// 		mutators.recalculateZoneItemCounts();
// 	},
// 	recalculateZoneItemCounts:function() {
// 		var counts = {};
// 		Object.entries(store.activeItemZones).forEach(([itemId, zoneId]) => {
// 			counts[zoneId] = counts[zoneId] ? counts[zoneId] + 1 : 1;
// 		});
// 		Object.entries(counts).forEach(([zoneId, count]) => {
// 			Vue.set(store, 'zoneItemCount' + zoneId, count);
// 		});
// 		console.log(store);
// 	},
// };
