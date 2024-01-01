"use strict";

// Shared Colors Definition
const primary = '#6993FF';
const success = '#1BC5BD';
const info = '#8950FC';
const warning = '#FFA800';
const danger = '#F64E60';

// Class definition

var KTApexChartsDemo = function () {
	// Private functions
	var _demo3 = function () {
		const apexChart = "#chart_3";
		var options = {
			series: [{
				name: 'Net Profit',
				data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
			}, {
				name: 'Revenue',
				data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
			}, {
				name: 'Free Cash Flow',
				data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
			}],
			chart: {
				type: 'bar',
				height: 350
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			xaxis: {
				categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
			},
			yaxis: {
				title: {
					text: '$ (thousands)'
				}
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			},
			colors: [primary, success, warning]
		};

		var chart = new ApexCharts(document.querySelector(apexChart), options);
		chart.render();
	}
	return {
		// public functions
		init: function () {
			 _demo3();
		}
	};
}();

jQuery(document).ready(function () {
	KTApexChartsDemo.init();
});
