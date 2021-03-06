/**
 * Compendium Page
 */

'use strict';

const resultsTemplate = {
	data: [],
	links: {},
	meta: {},
};

Vue.component('ninja-dropdown', require('../components/NinjaDropdown.vue').default);
Vue.component('ninja-bag-button', require('../components/NinjaBagButton.vue').default);

const compendium = new Vue({
	name: 'Compendium',
	el: '#compendium',
	data: {
		firstLoad: true,
		loading: false,
		chapter: chapterStart || 'recipe',
		results: resultsTemplate,
		// These are submitted as parameters
		filters: {
			name: searchTerm,
			sauthor: typeof filterStart.author !== 'undefined' ? filterStart.author : '',
			// Arrays need pre-defined as arrays
			rclass: [],
			sublevel: [],
			rarity: [],
			eclass: [],
			scrafting: [],
			sgathering: [],
			sbattle: [],
			sorting: sortingFilters[0].key,
			perPage: perPageFilters[0].key
		},
		collapsed: recipeFilters
					.filter(function(record) {
						return ! record.expanded;
					}).map(function(record) {
						return record.key;
					}),
		sorting: 'name:asc',
		perPage: 15,
		// Setting to pass off to Ninja Dropdown
		ninjaFilters: {
			scroll   : scrollFilters,
			item     : itemFilters,
			recipe   : recipeFilters,
			equipment: equipmentFilters,
			sorting  : sortingFilters,
			perPage  : perPageFilters
		},
		expanded: null
	},
	mounted:function() {
		if (this.filters.name != '' || this.filters.sauthor != '')
			this.search();
	},
	created:function() {
		this.debouncedSearch = _.debounce(this.search, 250);
	},
	// watch: {
	// 	filters: {
	// 		handler:function(val) {
	// 			console.log(this, val);
	// 		},
	// 		deep: true
	// 	}
	// },
	methods: {
		refinementUpdated:function() {
			console.log(this.filters.perPage, this.filters.sorting);
			// Reset the page if name is altered
			this.filters.page = 1;

			this.debouncedSearch();
		},
		nameUpdated:function() {
			this.refinementUpdated();
		},
		toggleFilter:function(filter, value) {
			if (this.filters[filter].includes(value))
				this.filters[filter] = this.filters[filter].filter(function(filterValue) {
					return filterValue != value;
				});
			else
				this.filters[filter].push(value);

			this.search();
		},
		toggleCollapse:function(section) {
			if (this.collapsed.includes(section))
				this.collapsed = this.collapsed.filter(function(value) {
					return value != section;
				});
			else
				this.collapsed.push(section);

			this.search();
		},
		search:function() {
			// Clear data of any vue/observer interference
			var data = JSON.parse(JSON.stringify(Object.assign({}, this.filters)));

			// Remove any values that don't match what the chapter expects
			//  And remove anything collapsed sections
			var allowableFields = [];
			for (var prop in this.ninjaFilters[this.chapter])
			{
				if (this.collapsed.includes(this.ninjaFilters[this.chapter][prop].key))
					continue;

				if (this.ninjaFilters[this.chapter][prop].type == 'range')
				{
					allowableFields.push(this.ninjaFilters[this.chapter][prop].key + 'Min');
					allowableFields.push(this.ninjaFilters[this.chapter][prop].key + 'Max');
				}
				else
					allowableFields.push(this.ninjaFilters[this.chapter][prop].key);
			}

			// Any empty values also need removed
			for (var prop in data)
				if ( ! data[prop].length || ! allowableFields.includes(prop))
					delete data[prop];

			data.sorting = this.sorting.split(':')[0];
			data.ordering = this.sorting.split(':')[1];
			data.perPage = this.perPage;
			data.page = this.filters.page;

			this.loading = true;
			axios
				.post('/api/' + this.chapter, data)
				.then(response => {
					this.results = response.data;
					this.loading = this.firstLoad = false;
				})
				.catch(error => console.log(error));
		},
		previousPage:function() {
			this.filters.page = this.results.meta.current_page - 1;
			this.search();
		},
		nextPage:function() {
			this.filters.page = this.results.meta.current_page + 1;
			this.search();
		},
		ninjaDropdownUpdated:function(key, value) {
			this[key] = value;

			// Reset the page if any of these were altered
			this.filters.page = 1;

			this.search();
		},
		toggleScroll:function(index) {
			if (this.expanded == index)
				this.expanded = null;
			else
				this.expanded = index;
		},
		switchChapter:function(chapter) {
			this.results = resultsTemplate;
			this.chapter = chapter;
			this.search();
		}
	}
});
