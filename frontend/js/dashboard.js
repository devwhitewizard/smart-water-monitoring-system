// Dashboard JavaScript

let chart = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize dashboard
    await updateDashboard();
    
    // Update every 10 seconds
    setInterval(updateDashboard, 10000);
    
    // Initialize chart
    await initializeChart();
    
    // Load initial alerts
    await loadAlerts();
});

async function updateDashboard() {
    try {
        // Update timestamp
        document.getElementById('lastUpdate').innerHTML = 
            `Last updated: ${new Date().toLocaleTimeString()}`;
        
        // Get current readings
        const readings = await API.getCurrentReadings();
        
        // Update sensor values
        updateSensorValues(readings);
        
        // Check for abnormal patterns
        const abnormal = API.checkAbnormalPatterns(readings);
        if (abnormal.length > 0) {
            abnormal.forEach(issue => {
                API.addAlert('warning', issue);
            });
            await loadAlerts();
        }
        
        // Update risk prediction
        await updateRiskPrediction();
        
        // Update alert badge
        updateAlertBadge();
        
    } catch (error) {
        console.error('Dashboard update error:', error);
    }
}

function updateSensorValues(readings) {
    // Update pH
    const phValue = document.getElementById('ph-value');
    const phStatus = document.getElementById('ph-status');
    phValue.textContent = readings.ph;
    
    if (readings.ph < 6.5 || readings.ph > 8.5) {
        phStatus.textContent = 'Unsafe';
        phStatus.className = 'sensor-status danger';
        document.getElementById('ph-card').style.borderLeftColor = '#e76f51';
    } else {
        phStatus.textContent = 'Normal';
        phStatus.className = 'sensor-status normal';
        document.getElementById('ph-card').style.borderLeftColor = '#2a9d8f';
    }
    
    // Update Turbidity
    const turbidityValue = document.getElementById('turbidity-value');
    const turbidityStatus = document.getElementById('turbidity-status');
    turbidityValue.textContent = readings.turbidity;
    
    if (readings.turbidity > 5) {
        turbidityStatus.textContent = 'Unsafe';
        turbidityStatus.className = 'sensor-status danger';
        document.getElementById('turbidity-card').style.borderLeftColor = '#e76f51';
    } else {
        turbidityStatus.textContent = 'Normal';
        turbidityStatus.className = 'sensor-status normal';
        document.getElementById('turbidity-card').style.borderLeftColor = '#2a9d8f';
    }
    
    // Update Temperature
    const tempValue = document.getElementById('temp-value');
    const tempStatus = document.getElementById('temp-status');
    tempValue.textContent = readings.temperature;
    
    if (readings.temperature > 35 || readings.temperature < 5) {
        tempStatus.textContent = 'Extreme';
        tempStatus.className = 'sensor-status warning';
        document.getElementById('temp-card').style.borderLeftColor = '#e9c46a';
    } else {
        tempStatus.textContent = 'Normal';
        tempStatus.className = 'sensor-status normal';
        document.getElementById('temp-card').style.borderLeftColor = '#2a9d8f';
    }
    
    // Update Conductivity
    const condValue = document.getElementById('cond-value');
    const condStatus = document.getElementById('cond-status');
    condValue.textContent = readings.conductivity;
    
    if (readings.conductivity > 800) {
        condStatus.textContent = 'High';
        condStatus.className = 'sensor-status warning';
        document.getElementById('cond-card').style.borderLeftColor = '#e9c46a';
    } else {
        condStatus.textContent = 'Normal';
        condStatus.className = 'sensor-status normal';
        document.getElementById('cond-card').style.borderLeftColor = '#2a9d8f';
    }
}

async function initializeChart() {
    const ctx = document.getElementById('historicalChart').getContext('2d');
    
    const historicalData = await API.getHistoricalData();
    const labels = historicalData.map(d => {
        const date = new Date(d.timestamp);
        return `${date.getHours()}:00`;
    });
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'pH Level',
                    data: historicalData.map(d => d.ph),
                    borderColor: '#2a9d8f',
                    backgroundColor: 'rgba(42, 157, 143, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Turbidity (NTU)',
                    data: historicalData.map(d => d.turbidity),
                    borderColor: '#e76f51',
                    backgroundColor: 'rgba(231, 111, 81, 0.1)',
                    tension: 0.4,
                    hidden: true
                },
                {
                    label: 'Temperature (°C)',
                    data: historicalData.map(d => d.temperature),
                    borderColor: '#e9c46a',
                    backgroundColor: 'rgba(233, 196, 106, 0.1)',
                    tension: 0.4,
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function updateRiskPrediction() {
    const prediction = await API.getRiskPrediction();
    
    const riskGauge = document.getElementById('riskGauge');
    const predictionText = document.getElementById('predictionText');
    const predictionDetails = document.getElementById('predictionDetails');
    
    riskGauge.style.width = `${prediction.riskLevel}%`;
    riskGauge.textContent = `${prediction.riskLevel}%`;
    
    predictionText.textContent = prediction.description;
    
    // Update color based on risk level
    if (prediction.riskLevel < 30) {
        riskGauge.style.background = 'linear-gradient(90deg, #2a9d8f 0%, #2a9d8f 100%)';
        predictionText.style.color = '#2a9d8f';
    } else if (prediction.riskLevel < 60) {
        riskGauge.style.background = 'linear-gradient(90deg, #e9c46a 0%, #e9c46a 100%)';
        predictionText.style.color = '#e9c46a';
    } else {
        riskGauge.style.background = 'linear-gradient(90deg, #e76f51 0%, #e76f51 100%)';
        predictionText.style.color = '#e76f51';
    }
    
    // Update factors
    predictionDetails.innerHTML = prediction.factors
        .map(f => `<span><i class="fas fa-check-circle"></i> ${f}</span>`)
        .join('<br>');
}

async function loadAlerts() {
    const alerts = await API.getAlerts();
    const alertsList = document.getElementById('alertsList');
    
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <i class="fas ${alert.type === 'danger' ? 'fa-exclamation-circle' : 
                           alert.type === 'warning' ? 'fa-exclamation-triangle' : 
                           'fa-info-circle'}"></i>
            <span>${alert.message}</span>
            <small>${alert.time}</small>
        </div>
    `).join('');
    
    updateAlertBadge();
}

function updateAlertBadge() {
    const alertCount = document.getElementById('alertCount');
    const warnings = API.alerts.filter(a => a.type === 'warning' || a.type === 'danger').length;
    alertCount.textContent = warnings;
}

// Test SMS function
function testSMS() {
    const message = '⚠️ ALERT: Unusual water parameters detected at Main Station. pH: 8.9, Turbidity: 7.2 NTU. Avoid use until further notice.';
    
    API.sendSMSAlert('+1234567890', message)
        .then(() => {
            alert('Test SMS sent! (Check console for demo)');
            loadAlerts();
        });
}