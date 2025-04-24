const elevationHistory = [];
let chart = null;

document.getElementById("getAltitudeBtn").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  const historySection = document.getElementById("historySection");

  // Прелоадер
  resultDiv.innerHTML = `
    <div class="flex justify-center items-center space-x-2 mt-2">
      <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
      <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:.2s]"></div>
      <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:.4s]"></div>
      <span class="ml-2 text-blue-600 text-sm">Fetching elevation...</span>
    </div>
  `;

  if (!navigator.geolocation) {
    resultDiv.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`);
        const data = await response.json();

        if (data?.results?.[0]) {
          const elevation = data.results[0].elevation;
          elevationHistory.push(elevation);
          if (elevationHistory.length > 10) elevationHistory.shift();

          resultDiv.innerHTML = `
            <div class="animate-fade-in text-lg mt-4">
              📍 Your elevation is <strong class="text-blue-700">${elevation} meters</strong> above sea level.
            </div>
          `;

          updateChart();
          historySection.style.opacity = "1";
        } else {
          resultDiv.textContent = "Could not retrieve elevation data.";
        }
      } catch (error) {
        console.error("Error fetching elevation:", error);
        resultDiv.textContent = "⚠️ An error occurred while fetching elevation.";
      }
    },
    () => {
      resultDiv.textContent = "⚠️ Unable to get your location.";
    }
  );
});

function updateChart() {
  const ctx = document.getElementById("elevationChart").getContext("2d");

  if (chart) {
    chart.data.labels = elevationHistory.map((_, i) => `#${i + 1}`);
    chart.data.datasets[0].data = elevationHistory;
    chart.update();
  } else {
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: elevationHistory.map((_, i) => `#${i + 1}`),
        datasets: [{
          label: "Elevation (m)",
          data: elevationHistory,
          fill: true,
          borderColor: "#2563eb",
          borderWidth: 3,
          borderDash: [5, 3],
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          tension: 0.6,
          pointStyle: "rectRounded",
          pointRadius: 6,
          pointHoverRadius: 9,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: "#4B5563",
              callback: (val) => `${val} m`
            }
          },
          x: {
            ticks: {
              color: "#4B5563"
            }
          }
        }
      }
    });
  }
}