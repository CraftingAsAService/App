@extends('app', [
	'active' => '/craft',
	'css' => [
		// 'pages/sling',
	],
	'js' => [
		'pages/craft',
	]
])

@section('scripts')
<script>
	var nodeTypes = {!! json_encode(config('game.nodeTypes')) !!};
	@foreach (['preferredRecipeIds', 'givenItemIds', 'quantities', 'breakdown', 'items', 'recipes', 'nodes', 'zones', 'rewards', 'mobs', 'shops'] as $var)
	var {{ $var }} = {!! json_encode($$var) !!};
	@endforeach
	var maps = [
		@foreach ($breakdown as $zoneId => $itemIds)
		@if (isset($maps[$zoneId]))
		@foreach ($maps[$zoneId] as $key => $data)
		{
			id: '{{ uniqid() }}',
			name: '{{ $zones[$zoneId]['name'] }}',
			src: '/assets/{{ config('game.slug') }}/m/{{ $data['image'] }}.jpg',
			{{--
			Goes from 1,1 to 44,44 (as opposed to 0,0 to x,y)
			anything less than 1,1 is unreachable
			44,44 itself is unreachable
			--}}
			bounds: [[1, 1], [44, 44]],
			size: {{ $data['size'] }},
			offset: {
				x: {{ $data['offset']['x'] }},
				y: {{ $data['offset']['y'] }}
			},
			markers: [
				@foreach ($itemIds as $itemId => $itemData)
				@foreach ($itemData['nodes'] ?? [] as $nodeId => $data)
				{
					'id': '{{ uniqid() }}',
					'tooltip': 'Level {{ $nodes[$nodeId]['level'] }} {{ config('game.nodeTypes')[$nodes[$nodeId]['type']]['name'] }}',
					'x': {{ $data['x'] }},
					'y': {{ $data['y'] }},
					'icon': '/assets/{{ config('game.slug') }}/map/icons/{{ config('game.nodeTypes')[$nodes[$nodeId]['type']]['icon'] }}.png'
				}{{ $loop->parent->last ? '' : ',' }}
				@endforeach
				@endforeach
			]
		}{{ $loop->parent->last ? '' : ',' }}
		@endforeach
		@endif
		@endforeach
	];
</script>
@endsection

@section('topContent')
	<div class='minor-media mb-3' hidden>
		<img src='/assets/{{ config('game.slug') }}/cover.jpg' alt='{{ config('game.data.name') }}'>
		<div class='text'>
			<h1>Crafting</h1>
		</div>
	</div>
@endsection

@section('content')
						<style>
							.enemy-node {
								position: absolute;
								top: 20%;
								left: 20%;
							}
							.npc-node {
								position: absolute;
								top: 30%;
								left: 50%;
							}
							.object-node {
								position: absolute;
								top: 40%;
								left: 60%;
							}
							.gathering-node {
								position: absolute;
								top: 40%;
								left: 40%;
							}
							.treasure-node {
								position: absolute;
								top: 45%;
								left: 50%;
							}

							.item.-done {
								opacity: .5;
							}
							/*.item.-done .icon {
								width: 24px;
								height: 24px;
							}*/
							.item.-done .sources {
								display: none;
							}
						</style>

		<div id='craft'>

			<div class='row'>
				<div class='col-sm-4'>
					<h3>
						Collect
					</h3>

					<div class='card'>
						<div class='card__content'>
							<div v-for='(zoneId, key) in sortedBreakdown' class='zone'>
								<h5 class='name'>
									<i class='fas fa-map-marked -desize float-right' hidden></i>
									<span v-html='zones[zoneId].name'></span>
								</h5>
								<crafting-reagent v-for='(sources, itemId) in breakdown[zoneId]' :item='items[itemId]' :sources='sources' @pass-have-item-to-parent='haveItem'></crafting-reagent>
								<hr>
							</div>
						</div>
					</div>
				</div>
				<div class='col-sm-4'>
					<h3>
						&nbsp;
					</h3>
					<div class='scroll-container'>
						<div id='mapContainer' class='todo-map-that-scrolls-with-you' style='height: 379px;'>
							<ninja-map v-for='(map, index) in maps' :key='map.id' :map-name='map.name' :map-src='map.src' :map-bounds='map.bounds' :markers='map.markers' :active='index === activeMap' />
						</div>
					</div>
				</div>
				<div class='col-sm-4'>
					<h3>
						Craft
					</h3>

					<div class='card'>
						<div class='card__content'>

							<div v-for='(jobId, key) in sortedJobs' class='job'>
								<h5 class='name'>
									<i class='fas fa-map-marked -desize float-right' hidden></i>
									<span v-html='zones[zoneId].name'></span>
								</h5>
								<crafting-reagent v-for='(sources, itemId) in breakdown[zoneId]' :item='items[itemId]' :sources='sources' @pass-have-item-to-parent='haveItem'></crafting-reagent>
								<hr>
							</div>
							@foreach ($recipeJobs as $job)
							<div>
								@if ( ! $loop->first)
									<hr>
								@endif
								<h5>
									<img src='/assets/{{ config('game.slug') }}/jobs/{{ $job->icon }}.png' alt='' width='20' height='20' class='icon mr-1'>
									{{ ucwords($job->name) }}
								</h5>
								@foreach ($recipes as $recipe)
									@if ($recipe->job_id == $job->id)
										<crafting-recipe :recipe='recipes[recipeId]' :item='items[recipes[recipeId].itemId]' @pass-have-recipe-to-parent='haveRecipe'></crafting-recipe>
									@endif
								@endforeach
							</div>
							@endforeach
						</div>
					</div>

				</div>
			</div>


			<hr class='mt-5'>

			Ideas

			<div class='row'>
				<div class='col-sm-4'>
					<div class='card'>
						<div class='card__content'>


							<p>
								&hellip;7 of your crafting recipes can be purchased. _View_&hellip;
							</p>
							<div>
								<h5>
									<i class='far fa-map -desize mr-2'></i>Unknown Locations
								</h5>
							</div>
							&hellip;

							<div>
								<h5 class='mt-3'>
									<i class='fas fa-map-pin -desize float-right'></i>
									<i class='fas fa-map-marked -desize mr-2'></i>Central Shroud - Bentbranch
								</h5>
							</div>
							<div class='row item'>
								<div class='col-auto'>
									<img src='/assets/{{ config('game.slug') }}/i/020000/020034.png' alt='' width='48' height='48'>
								</div>
								<div class='col info'>
									<big class='rarity-2'>Elm Log</big>
									<div class='sources'>
										<img src='/assets/{{ config('game.slug') }}/map/icons/spearfishing.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/fishing.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/fishing-unspoiled.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/mining.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/mining-unspoiled.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/quarrying.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/quarrying-unspoiled.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/logging.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/logging-unspoiled.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/harvesting.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/harvesting-unspoiled.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/vendor.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/battle.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/landmark.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/blue-outline.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/red-outline.png' alt=''>
										<img src='/assets/{{ config('game.slug') }}/map/icons/aetheryte.png' alt=''>
										{{-- <i class='fas fa-caret-square-down text-primary'></i> --}}
										{{-- <i class='fas fa-expand-arrows-alt text-primary'></i> --}}
										{{-- <i class='fas fa-expand text-primary'></i> --}}

										{{-- <span class=''>
											<i class='fas fa-tree'></i>
											<i class='fas fa-skull-crossbones'></i>
										</span>
										<span class='text-muted small'>
											<i class='fas fa-mountain -desize'></i>
											<i class='fas fa-piggy-bank -desize mr-1'></i>
										</span> --}}
									</div>
								</div>
								<div class='col-auto'>
									<div class='form-group tally'>
										<big><small class='text-muted'>x</small>7</big>
										<label class='checkbox ml-2' style='width: 24px;'>
											<input type='checkbox' value='option1' checked='checked'>
											<span class='checkbox-indicator' style='width: 24px; height: 24px; top: -10px;'></span>
										</label>
									</div>
								</div>
							</div>
							<div class='row item'>
								<div class='col-auto'>
									<img src='/assets/{{ config('game.slug') }}/i/020000/020034.png' alt='' width='48' height='48'>
								</div>
								<div class='col info'>
									<big class='rarity-2'>Elm Log</big>
									<div class='sources card p-2 mt-2'>
										<i class='fas fa-caret-square-up text-primary'></i>
										{{-- <i class='fas fa-compress-arrows-alt text-primary'></i> --}}
										{{-- <i class='fas fa-compress text-primary'></i> --}}
										<div>
											<i class='fas fa-tree'></i> <code>20,20</code> Mature Tree - <code>55%</code>
										</div>
										<div>
											<i class='fas fa-skull-crossbones'></i> <code>8,13</code> Dragon - <code>60%</code>
										</div>
										<div class='text-muted small'>
											<i class='fas fa-mountain'></i>
											<i class='fas fa-piggy-bank mr-1'></i>
											available elsewhere
										</div>
									</div>
								</div>
								<div class='col-auto'>
									<div class='form-group tally'>
										<big><small class='text-muted'>x</small>7</big>
										<label class='checkbox ml-2' style='width: 24px;'>
											<input type='checkbox' value='option1' checked='checked'>
											<span class='checkbox-indicator' style='width: 24px; height: 24px; top: -10px;'></span>
										</label>
									</div>
								</div>
							</div>
							<div class='item'>
								<div class='info'>
									<div class='form-group tally float-right'>
										<i class='fas fa-cogs ml-2 mr-2'></i>
										<input type='number' placeholder='0' min='0' max='7'><big><code> / </code>7</big>
										{{-- <big>
											<small class='text-muted'>x</small>7
										</big> --}}
										{{-- <div class='input-group' style='width: 120px;'>
											<input type='number' class='form-control' placeholder='0'>
											<div class='input-group-append'>
												<span class='input-group-text' id='basic-addon2'></span>
											</div>
										</div> --}}
										<label class='checkbox ml-2' style='width: 24px;'>
											<input type='checkbox' value='option1' checked='checked'>
											<span class='checkbox-indicator' style='width: 24px; height: 24px; top: -10px;'></span>
										</label>
									</div>
									<div class='title'>
										<img src='/assets/{{ config('game.slug') }}/i/020000/020034.png' alt='' width='32' height='32' class='mr-1'>
										<big class='mr-2'>Elm Log</big>
									</div>
								</div>
								<div class='sources'>
									<div class=''>
										<i class='fas fa-tree'></i> <code>20,20</code> Mature Tree - <code>55%</code>
									</div>
									<div class=''>
										<i class='fas fa-skull-crossbones'></i> <code>8,13</code> Dragon - <code>60%</code>
									</div>
									<div class='text-muted small'>
										<i class='fas fa-mountain'></i>
										<i class='fas fa-piggy-bank mr-1'></i>
										available elsewhere
									</div>
								</div>
							</div>
							<div class='item'>
								<div class='info'>
									<div class='form-group tally float-right'>
										<i class='far fa-dot-circle text-muted' data-toggle='tooltip' title='Location Options Limited'></i>
										<i class='fas fa-cogs ml-2 mr-2'></i>
										<big>
											<small class='text-muted'>x</small>22
										</big>
										<label class='checkbox ml-2' style='width: 24px;'>
											<input type='checkbox' value='option1' checked='checked'>
											<span class='checkbox-indicator' style='width: 24px; height: 24px; top: -10px;'></span>
										</label>
									</div>
									<div class='title'>
										<img src='/assets/{{ config('game.slug') }}/i/020000/020034.png' alt='' width='32' height='32' class='mr-1'>
										<big class='mr-2'>Feather</big>
									</div>
								</div>
								<div class='sources'>
									<div class=''>
										<i class='fas fa-mountain'></i> <code>x,y</code> Mining Node
									</div>
									<div class=''>
										<i class='fas fa-piggy-bank'></i> <code>x,y</code> Animal Skin Shop - <code>4<i class='fas fa-coins ml-1'></i></code>
									</div>
								</div>
							</div>
							&hellip;
							<div>
								<h5 class='mt-3'>
									<i class='fas fa-map-marked -desize mr-2'></i>Area B - Region Y
								</h5>
							</div>
							<div class='item'>
								<div class='info'>
									<div class='tally float-right'>
										7 [x]
									</div>
									<div class='title'>[Image] Acorn</div>
								</div>
								<div class='sources'>
									<div class=''>
										[i] <code>x,y</code> Node Name
									</div>
									<div class=''>
										[i] <code>x,y</code> NPC/Shop Name
									</div>
								</div>
							</div>
							<div class='item'>
								& others hidden
							</div>
							<div>
								<h5 class='mt-3'>
									<i class='fas fa-ban -desize mr-2'></i>Ignored Items
								</h5>
							</div>
							[Image] [Image]
						</div>
					</div>
				</div>
			</div>
		</div>


@endsection
