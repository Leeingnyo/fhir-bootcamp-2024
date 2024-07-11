import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { LineChartData } from '../hooks/chat';

/**
 * https://chatgpt.com/share/4ea1f414-1bcb-4fae-923f-dd424fed4225
 */
const colors = ['#FF4500', '#32CD32', '#FF1493', '#00CED1', '#D2691E', '#6A5ACD', '#FFA07A', '#4682B4', '#FF69B4', '#ADFF2F', '#FF6347', '#8A2BE2', '#FFD700', '#00FA9A', '#4169E1', '#FF8C00'];

// TODO: 달라지는 부분들을 context 로 뽑아서 option 을 만들어주기

interface ChatLineChartProps {
  lineChart: LineChartData;
}
export const ChatLineChart = ({ lineChart }: ChatLineChartProps) => {
  return lineChart.xtype === 'date' ? (
    <DateAxisLineChart lineChart={lineChart} />
  ) : (
    <SimpleLineChart lineChart={lineChart} />
  );
};

export const SimpleLineChart = ({ lineChart }: ChatLineChartProps) => {
  return (
    <LineChart width={600} height={400} data={lineChart.data} style={{ marginBottom: '10px' }}>
      {lineChart.values.map((value, index) => (
        <Line key={value} type="monotone" dataKey={value} stroke={colors[index % 16]} />
      ))}
      <CartesianGrid stroke="#ccc" />
      <Legend
        verticalAlign="top"
        height={36}
        formatter={(value, _entry, index) => {
          return lineChart.labels?.[index] ?? value;
        }}
      />
      <XAxis
        dataKey={lineChart.xkey}
        padding="gap"
        tickCount={lineChart.data.length}
      />
      <YAxis unit={lineChart.yunit} width={30 + (lineChart.yunit?.length ?? 0) * 10} />
      <Tooltip
        formatter={(value, name, _payload, index) => {
          return [`${value} ${lineChart.yunit}`, lineChart.labels?.[index] ?? name];
        }}
      />
    </LineChart>
  )
};

export const DateAxisLineChart = ({ lineChart }: ChatLineChartProps) => {
  return (
    <LineChart width={600} height={400} data={lineChart.data} style={{ marginBottom: '10px' }}>
      {lineChart.values.map((value, index) => (
        <Line key={value} type="monotone" dataKey={value} stroke={colors[index % 16]} />
      ))}
      <CartesianGrid stroke="#ccc" />
      <Legend
        verticalAlign="top"
        height={36}
        formatter={(value, _entry, index) => {
          return lineChart.labels?.[index] ?? value;
        }}
      />
      <XAxis
        dataKey={lineChart.xkey}
        type="number"
        domain={['dataMin', 'dataMax']}
        allowDataOverflow
        tickFormatter={(payload) => new Date(payload).toLocaleDateString()}
        padding="gap"
        tickCount={lineChart.data.length}
      />
      <YAxis unit={lineChart.yunit} width={30 + (lineChart.yunit?.length ?? 0) * 10} />
      <Tooltip
        formatter={(value, name, _payload, index) => {
          return [`${value} ${lineChart.yunit}`, lineChart.labels?.[index] ?? name];
        }}
        labelFormatter={(label) => {
          return new Date(label).toLocaleDateString();
        }}
      />
    </LineChart>
  )
};
