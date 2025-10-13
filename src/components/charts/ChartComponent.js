import React, { useEffect, useState } from 'react';

const ChartComponent = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate data processing
    const processData = async () => {
      setIsProcessing(true);
      
      // Simulate async data processing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const processedData = data?.map((item, index) => ({
        id: index,
        label: item.label || `Item ${index}`,
        value: item.value || Math.random() * 100,
        color: item.color || `hsl(${index * 60}, 70%, 50%)`
      })) || [
        { id: 0, label: 'Sample A', value: 45, color: 'hsl(0, 70%, 50%)' },
        { id: 1, label: 'Sample B', value: 30, color: 'hsl(60, 70%, 50%)' },
        { id: 2, label: 'Sample C', value: 25, color: 'hsl(120, 70%, 50%)' }
      ];
      
      setChartData(processedData);
      setIsProcessing(false);
    };

    processData();
  }, [data]);

  if (isProcessing) {
    return (
      <div data-testid="chart-processing" className="chart-processing">
        Processing chart data...
      </div>
    );
  }

  return (
    <div data-testid="chart-container" className="chart-container">
      <div className="chart-header">
        <h3>Performance Chart</h3>
      </div>
      
      <div className="chart-content">
        {chartData.map((item) => (
          <div 
            key={item.id}
            data-testid={`chart-bar-${item.id}`}
            className="chart-bar"
            style={{
              height: `${item.value * 2}px`,
              backgroundColor: item.color,
              width: '60px',
              margin: '0 5px',
              display: 'inline-block',
              verticalAlign: 'bottom'
            }}
            title={`${item.label}: ${item.value}`}
          >
            <div className="bar-label">{item.label}</div>
            <div className="bar-value" data-testid={`chart-value-${item.id}`}>
              {item.value.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="chart-legend" data-testid="chart-legend">
        {chartData.map((item) => (
          <div key={item.id} className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartComponent;
