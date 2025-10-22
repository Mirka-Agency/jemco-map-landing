document.addEventListener("DOMContentLoaded", function () {
	// --- 1. Intersection Observer for Scroll Animations ---
	const observerOptions = {
		root: null, // viewport
		rootMargin: "0px",
		threshold: 0.1, // 10% of the element is visible
	};

	const observer = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target); // Stop observing once animated
			}
		});
	}, observerOptions);

	// Observe all elements with the .animate-on-scroll class
	const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
	elementsToAnimate.forEach((el) => {
		observer.observe(el);
	});

	// --- 2. Interactive Savings Chart ---

	// Check if Chart.js and the canvas element exist
	if (
		typeof Chart === "undefined" ||
		!document.getElementById("savingsChart")
	) {
		console.error("Chart.js or canvas element not found.");
		return;
	}

	const ctx = document.getElementById("savingsChart").getContext("2d");
	const slider = document.getElementById("years-slider");
	const yearsDisplay = document.getElementById("years-display");

	// --- Constants for Calculation (user-provided) ---
	// Annual cost savings for 8 produced units (in میلیارد تومان)
	const COST_SAVED_VS_SIEMENS_PER_YEAR_BILLION = 6.5; // میلیارد تومان در سال
	const COST_SAVED_VS_ABB_PER_YEAR_BILLION = 9.5; // میلیارد تومان در سال

	// --- Global Chart Configuration ---
	Chart.defaults.color = "#a0a0c0"; // Legend/Axis color
	Chart.defaults.font.family = "Roboto";
	Chart.defaults.plugins.tooltip.backgroundColor = "#0a0c1f";
	Chart.defaults.plugins.tooltip.titleFont = {
		family: "Montserrat",
		weight: "bold",
	};
	Chart.defaults.plugins.tooltip.bodyFont = { family: "Roboto" };
	Chart.defaults.plugins.tooltip.padding = 10;
	Chart.defaults.plugins.tooltip.cornerRadius = 5;

	// --- Create the Chart Instance ---
	const savingsChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: [], // To be populated by updateChart
			datasets: [
				{
					label: "پس‌انداز تجمعی (میلیارد تومان) در برابر ABB",
					data: [], // To be populated
					borderColor: "#f94144", // Red
					backgroundColor: "rgba(249, 65, 68, 0.1)",
					borderWidth: 3,
					fill: "start",
					tension: 0.3,
				},
				{
					label: "پس‌انداز تجمعی (میلیارد تومان) در برابر زیمنس",
					data: [], // To be populated
					borderColor: "#f3722c", // Orange
					backgroundColor: "rgba(243, 114, 44, 0.1)",
					borderWidth: 3,
					fill: "start",
					tension: 0.3,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: "پس‌انداز تجمعی (میلیارد تومان)",
						font: {
							family: "Montserrat",
							size: 14,
							weight: "600",
						},
						color: "#e0e0e0",
					},
					ticks: {
						// Format numbers to be more readable (e.g., 100k, 1M)
						callback: function (value, index, values) {
							if (value >= 1000000) {
								return value / 1000000 + "M";
							}
							if (value >= 1000) {
								return value / 1000 + "k";
							}
							return value;
						},
					},
				},
				x: {
					title: {
						display: true,
						text: "سال‌های بهره‌برداری",
						font: {
							family: "Montserrat",
							size: 14,
							weight: "600",
						},
						color: "#e0e0e0",
					},
				},
			},
			plugins: {
				legend: {
					position: "bottom",
					labels: {
						usePointStyle: true,
						pointStyle: "rectRounded",
					},
				},
				tooltip: {
					mode: "index",
					intersect: false,
					callbacks: {
						// Tooltip formatting will be handled dynamically and localized
						label: function (context) {
							const mode = window.__chartMode || "kwh";
							let label = context.dataset.label || "";
							if (label) label += " — ";
							if (context.parsed.y !== null) {
								if (mode === "kwh") {
									label +=
										context.parsed.y.toLocaleString() +
										" kWh";
								} else {
									label +=
										context.parsed.y.toLocaleString(
											undefined,
											{ maximumFractionDigits: 2 }
										) + " میلیارد تومان";
								}
							}
							return label;
						},
					},
				},
			},
			interaction: {
				mode: "index",
				intersect: false,
			},
		},
	});

	// --- Function to Update Chart Data ---
	function updateChart(years) {
		let labels = [];
		let siemensData = [];
		let abbData = [];
		for (let i = 1; i <= years; i++) {
			labels.push(`سال ${i}`);
			// Use provided annual cost savings (in میلیارد تومان) and accumulate
			const siemensCumulative =
				COST_SAVED_VS_SIEMENS_PER_YEAR_BILLION * i;
			const abbCumulative = COST_SAVED_VS_ABB_PER_YEAR_BILLION * i;
			siemensData.push(siemensCumulative);
			abbData.push(abbCumulative);
		}

		// Update the chart's data, set axis label to cost and rerender
		savingsChart.data.labels = labels;
		savingsChart.data.datasets[0].data = abbData;
		savingsChart.data.datasets[1].data = siemensData;
		savingsChart.options.scales.y.title.text =
			"پس‌انداز تجمعی (میلیارد تومان)";
		savingsChart.update();
	}

	// --- Event Listener for the Slider ---
	slider.addEventListener("input", (event) => {
		const years = event.target.value;
		yearsDisplay.textContent = `${years} سال`;
		updateChart(years);
	});

	// --- Chart mode toggles ---
	// chart is now cost-only (میلیارد تومان)

	// --- Initial Chart Render ---
	// Initialize the chart with the slider's default value
	updateChart(slider.value);
});
