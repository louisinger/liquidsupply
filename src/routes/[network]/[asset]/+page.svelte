<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import { registerables, Chart, type ChartData } from 'chart.js';
	Chart.register(...registerables);

	import type { SupplyPageData } from '$lib/types';
	import type { SupplyGraph } from '$lib/domain/supplyGraph';
	import type { Point } from 'chart.js/dist/core/core.controller';

	export let data: SupplyPageData;

	function makeSupplyY(supply: SupplyGraph) {
		const supplyY = [];

		for (const { txs } of supply) {
			const addSupply = txs.reduce((acc, { supplyModifier }) => {
				return acc + supplyModifier;
			}, 0);

			let lastSupply = 0;
			if (supplyY.length > 0) {
				lastSupply = supplyY[supplyY.length - 1];
			}

			supplyY.push(lastSupply + addSupply);
		}
		return supplyY;
	}

	const lineData: ChartData<"line", (number | Point)[], unknown> = {
		labels: data.supply.map((x) => new Date(x.blockTime * 1000).toLocaleDateString()),
		datasets: [
			{
				label: data.params.asset,
				fill: true,
				backgroundColor: 'rgba(225, 204,230, .3)',
				borderColor: 'rgb(205, 130, 158)',
				pointBorderColor: 'rgb(205, 130,1 58)',
				pointBackgroundColor: 'rgb(255, 255, 255)',
				pointBorderWidth: 10,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: 'rgb(0, 0, 0)',
				pointHoverBorderColor: 'rgba(220, 220, 220,1)',
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: makeSupplyY(data.supply)
			}
		]
	};
</script>

<div>
	<p>{data.params.network} / {data.params.asset}</p>
	<div class="container">
		<Line data={lineData} options={{ responsive: true }} />
	</div>
</div>
