<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import { registerables, Chart, type ChartData } from 'chart.js';
	import 'chartjs-adapter-date-fns';

	Chart.defaults.color = '#fff';
	Chart.register(...registerables);

	import type { SupplyPageData } from '$lib/types';
	import type { SupplyGraph } from '$lib/domain/supplyGraph';
	import type { Point } from 'chart.js/dist/core/core.controller';

	export let data: SupplyPageData;

	function makeSupplyY(supply: SupplyGraph) {
		const supplyY = [];

		for (const { txs, blockTime } of supply) {
			const addSupply = txs.reduce((acc, { supplyModifier }) => {
				return acc + supplyModifier;
			}, 0);

			let lastSupply = 0;
			if (supplyY.length > 0) {
				lastSupply = supplyY[supplyY.length - 1].y;
			}

			supplyY.push({
				x: blockTime * 1000,
				y: lastSupply + addSupply / 10 ** data.infos.precision
			});
		}
		return supplyY;
	}

	const lineData: ChartData<'line', (number | Point)[], unknown> = {
		datasets: [
			{
				label: data.infos.name,
				borderColor: '#ff0080',
				pointBorderColor: '#fff',
				pointBackgroundColor: 'rgb(255, 255, 255)',
				pointBorderWidth: 3,
				pointHoverBackgroundColor: 'rgb(250, 0, 0)',
				pointHoverBorderColor: 'rgb(205, 130, 158)',
				pointHoverBorderWidth: 5,
				pointRadius: 1,
				data: makeSupplyY(data.supply),
				tension: 0
			}
		]
	};
</script>

<div class="container">
	<p class="title is-3 has-text-centered has-text-white">Supply for {data.infos.name}</p>
	<Line
		data={lineData}
		options={{
			responsive: true,
			scales: {
				x: {
					grid: {
						display: false
					},
					stacked: true,
					type: 'time',
					time: {
						unit: 'week'
					}
				}
			}
		}}
	/>
</div>
